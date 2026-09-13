package com.ivy.assignment.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ivy.assignment.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class IvyApiClient {
    private static final Logger log = LoggerFactory.getLogger(IvyApiClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ivy.api.base-url:https://solve.ivy.homes}")
    private String baseUrl = "https://solve.ivy.homes";

    @Value("${ivy.api.key:}")
    private String apiKey;

    @Value("${ivy.api.email:demo1@ivy.homes}")
    private String email = "demo1@ivy.homes";

    @Value("${ivy.api.password:}")
    private String password;

    private String currentAccessToken;
    private String currentRefreshToken;

    public IvyApiClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public synchronized String getValidToken() {
        if (currentAccessToken == null) {
            login(getEmail(), getPassword());
        }
        return currentAccessToken;
    }

    public AuthResponse login(String userEmail, String userPassword) {
        String url = baseUrl + "/auth/login";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", getApiKey());

        Map<String, String> body = new HashMap<>();
        body.put("email", userEmail);
        body.put("password", userPassword);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            AuthResponse authResponse = objectMapper.readValue(response.getBody(), AuthResponse.class);
            this.currentAccessToken = authResponse.getAccessToken();
            this.currentRefreshToken = authResponse.getRefreshToken();
            log.info("Successfully authenticated as {} against {}", userEmail, url);
            return authResponse;
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", userEmail, e.getMessage());
            throw new RuntimeException("Failed to login to Ivy API: " + e.getMessage(), e);
        }
    }

    public AuthResponse refreshToken() {
        if (currentRefreshToken == null) {
            return login(email, password);
        }
        String url = baseUrl + "/auth/refresh";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", apiKey);

        Map<String, String> body = new HashMap<>();
        body.put("refresh_token", currentRefreshToken);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            AuthResponse authResponse = objectMapper.readValue(response.getBody(), AuthResponse.class);
            this.currentAccessToken = authResponse.getAccessToken();
            if (authResponse.getRefreshToken() != null) {
                this.currentRefreshToken = authResponse.getRefreshToken();
            }
            log.info("Successfully refreshed Ivy access token");
            return authResponse;
        } catch (Exception e) {
            log.warn("Token refresh failed, re-authenticating: {}", e.getMessage());
            return login(email, password);
        }
    }

    public HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-Key", apiKey);
        headers.set("Authorization", "Bearer " + getValidToken());
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    public List<Listing> fetchAllListings() {
        return fetchAllPages("/v1/listings", new TypeReference<CollectionResponse<Listing>>() {});
    }

    public List<Rental> fetchAllRentals() {
        return fetchAllPages("/v1/rentals", new TypeReference<CollectionResponse<Rental>>() {});
    }

    public List<Project> fetchAllProjects() {
        return fetchAllPages("/v1/projects", new TypeReference<CollectionResponse<Project>>() {});
    }

    private <T> List<T> fetchAllPages(String endpoint, TypeReference<CollectionResponse<T>> typeRef) {
        List<T> allRecords = new ArrayList<>();
        int limit = 50; // Server maximum per page is 50
        int offset = 0;
        int totalExpected = -1;

        log.info("Starting ingestion for endpoint {}...", endpoint);

        while (true) {
            String url = String.format("%s%s?limit=%d&offset=%d", baseUrl, endpoint, limit, offset);
            HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders());

            try {
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                CollectionResponse<T> collection = objectMapper.readValue(response.getBody(), typeRef);

                if (collection.getTotal() != null) {
                    totalExpected = collection.getTotal();
                }

                List<T> items = collection.getResults();
                if (items == null || items.isEmpty()) {
                    break;
                }

                allRecords.addAll(items);
                log.info("Fetched {} -> offset: {}, page items: {}, total accumulated: {}/{}",
                        endpoint, offset, items.size(), allRecords.size(), totalExpected);

                if (Boolean.FALSE.equals(collection.getHasMore()) || allRecords.size() >= totalExpected) {
                    break;
                }

                offset += items.size();
                try {
                    Thread.sleep(25); // Respectful pause well below 1200 req/min
                } catch (InterruptedException ignored) {}

            } catch (HttpClientErrorException.Unauthorized e) {
                log.warn("Received 401 Unauthorized during ingestion, refreshing token...");
                refreshToken();
            } catch (Exception e) {
                log.error("Error fetching page at {}: {}", url, e.getMessage());
                break;
            }
        }

        log.info("Completed ingestion for {}. Total records fetched: {}", endpoint, allRecords.size());
        return allRecords;
    }

    public String getBaseUrl() { return baseUrl; }
    public String getApiKey() { return apiKey != null && !apiKey.isBlank() ? apiKey : System.getenv("IVY_API_KEY"); }
    public String getEmail() { return email != null && !email.isBlank() ? email : System.getenv("IVY_DEMO_EMAIL"); }
    public String getPassword() { return password != null && !password.isBlank() ? password : System.getenv("IVY_DEMO_PASSWORD"); }
}
