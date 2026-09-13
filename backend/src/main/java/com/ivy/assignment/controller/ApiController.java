package com.ivy.assignment.controller;

import com.ivy.assignment.client.IvyApiClient;
import com.ivy.assignment.model.*;
import com.ivy.assignment.service.DataAuditorService;
import com.ivy.assignment.service.DataIngestionService;
import com.ivy.assignment.service.DiscrepancyDetectorService;
import com.ivy.assignment.service.SubmissionGeneratorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final IvyApiClient apiClient;
    private final DataIngestionService ingestionService;
    private final DataAuditorService auditorService;
    private final DiscrepancyDetectorService discrepancyDetectorService;
    private final SubmissionGeneratorService submissionGeneratorService;

    public ApiController(IvyApiClient apiClient,
                         DataIngestionService ingestionService,
                         DataAuditorService auditorService,
                         DiscrepancyDetectorService discrepancyDetectorService,
                         SubmissionGeneratorService submissionGeneratorService) {
        this.apiClient = apiClient;
        this.ingestionService = ingestionService;
        this.auditorService = auditorService;
        this.discrepancyDetectorService = discrepancyDetectorService;
        this.submissionGeneratorService = submissionGeneratorService;
    }

    // 1. Auth Endpoint
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("detail", "Email and password are required"));
        }

        try {
            AuthResponse response = apiClient.login(email, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Fallback for valid demo accounts if external API is temporarily unreachable
            if (("demo1@ivy.homes".equalsIgnoreCase(email) ||
                 "demo2@ivy.homes".equalsIgnoreCase(email) ||
                 "demo3@ivy.homes".equalsIgnoreCase(email)) && 
                apiClient.getPassword() != null && apiClient.getPassword().equals(password)) {
                AuthResponse fallback = new AuthResponse();
                fallback.setAccessToken("mock_token_" + UUID.randomUUID());
                fallback.setRefreshToken("mock_refresh_" + UUID.randomUUID());
                fallback.setTokenType("Bearer");
                fallback.setExpiresIn(900);
                fallback.setRefreshUrl("/auth/refresh");
                fallback.setUser(Map.of("email", email));
                return ResponseEntity.ok(fallback);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Invalid credentials"));
        }
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refresh() {
        try {
            AuthResponse refreshed = apiClient.refreshToken();
            return ResponseEntity.ok(refreshed);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "Failed to refresh token"));
        }
    }

    // 2. Listings with robust client/server filtering fallbacks
    @GetMapping("/listings")
    public ResponseEntity<Map<String, Object>> getListings(
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) Integer bhk,
            @RequestParam(required = false) String property_type,
            @RequestParam(required = false) Long min_price,
            @RequestParam(required = false) Long max_price,
            @RequestParam(required = false) String furnishing,
            @RequestParam(required = false) Boolean is_live,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort_by,
            @RequestParam(required = false, defaultValue = "asc") String order,
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false, defaultValue = "0") int offset
    ) {
        List<Listing> all = ingestionService.getListings();

        List<Listing> filtered = all.stream().filter(l -> {
            if (locality != null && !locality.isBlank()) {
                if (l.getLocality() == null || !l.getLocality().equalsIgnoreCase(locality.trim())) return false;
            }
            if (bhk != null) {
                if (l.getBedroom() == null || !l.getBedroom().equals(bhk)) return false;
            }
            if (property_type != null && !property_type.isBlank()) {
                if (l.getPropertyType() == null || !l.getPropertyType().equalsIgnoreCase(property_type.trim())) return false;
            }
            if (furnishing != null && !furnishing.isBlank()) {
                if (l.getFurnishing() == null || !l.getFurnishing().equalsIgnoreCase(furnishing.trim())) return false;
            }
            if (min_price != null) {
                if (l.getPrice() == null || l.getPrice() < min_price) return false;
            }
            if (max_price != null) {
                if (l.getPrice() == null || l.getPrice() > max_price) return false;
            }
            if (is_live != null) {
                if (!Objects.equals(l.getIsLive(), is_live)) return false;
            }
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase().trim();
                boolean matchesName = l.getApartmentName() != null && l.getApartmentName().toLowerCase().contains(q);
                boolean matchesLoc = l.getLocality() != null && l.getLocality().toLowerCase().contains(q);
                boolean matchesId = l.getListingId() != null && l.getListingId().toLowerCase().contains(q);
                boolean matchesDesc = l.getDescription() != null && l.getDescription().toLowerCase().contains(q);
                if (!matchesName && !matchesLoc && !matchesId && !matchesDesc) return false;
            }
            return true;
        }).collect(Collectors.toList());

        // Sorting
        Comparator<Listing> comparator = null;
        if ("price".equalsIgnoreCase(sort_by)) {
            comparator = Comparator.comparing(l -> l.getPrice() != null ? l.getPrice() : 0L);
        } else if ("carpet_area".equalsIgnoreCase(sort_by)) {
            comparator = Comparator.comparing(l -> l.getCarpetArea() != null ? l.getCarpetArea() : 0.0);
        } else if ("bedroom".equalsIgnoreCase(sort_by)) {
            comparator = Comparator.comparing(l -> l.getBedroom() != null ? l.getBedroom() : 0);
        } else if ("posted_at".equalsIgnoreCase(sort_by)) {
            comparator = Comparator.comparing(l -> l.getPostedAt() != null ? l.getPostedAt() : "");
        }

        if (comparator != null) {
            if ("desc".equalsIgnoreCase(order)) {
                comparator = comparator.reversed();
            }
            filtered.sort(comparator);
        }

        int total = filtered.size();
        int safeOffset = Math.min(Math.max(offset, 0), total);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int safeEnd = Math.min(safeOffset + safeLimit, total);

        List<Listing> paged = filtered.subList(safeOffset, safeEnd);

        Map<String, Object> response = new HashMap<>();
        response.put("limit", safeLimit);
        response.put("offset", safeOffset);
        response.put("count", paged.size());
        response.put("total", total);
        response.put("has_more", safeEnd < total);
        response.put("results", paged);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListingById(@PathVariable String id) {
        return ingestionService.getListings().stream()
                .filter(l -> l.getListingId().equalsIgnoreCase(id))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Listing not found: " + id)));
    }

    // 3. Rentals
    @GetMapping("/rentals")
    public ResponseEntity<Map<String, Object>> getRentals(
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) Integer bhk,
            @RequestParam(required = false) String furnishing,
            @RequestParam(required = false) String sort_by,
            @RequestParam(required = false, defaultValue = "asc") String order,
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false, defaultValue = "0") int offset
    ) {
        List<Rental> all = ingestionService.getRentals();
        List<Rental> filtered = all.stream().filter(r -> {
            if (locality != null && !locality.isBlank()) {
                if (r.getLocality() == null || !r.getLocality().equalsIgnoreCase(locality.trim())) return false;
            }
            if (bhk != null) {
                if (r.getBedroom() == null || !r.getBedroom().equals(bhk)) return false;
            }
            if (furnishing != null && !furnishing.isBlank()) {
                if (r.getFurnishing() == null || !r.getFurnishing().equalsIgnoreCase(furnishing.trim())) return false;
            }
            return true;
        }).collect(Collectors.toList());

        if ("price".equalsIgnoreCase(sort_by)) {
            Comparator<Rental> comp = Comparator.comparing(r -> r.getPrice() != null ? r.getPrice() : 0L);
            if ("desc".equalsIgnoreCase(order)) comp = comp.reversed();
            filtered.sort(comp);
        }

        int total = filtered.size();
        int safeOffset = Math.min(Math.max(offset, 0), total);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int safeEnd = Math.min(safeOffset + safeLimit, total);

        List<Rental> paged = filtered.subList(safeOffset, safeEnd);

        Map<String, Object> response = new HashMap<>();
        response.put("limit", safeLimit);
        response.put("offset", safeOffset);
        response.put("count", paged.size());
        response.put("total", total);
        response.put("has_more", safeEnd < total);
        response.put("results", paged);

        return ResponseEntity.ok(response);
    }

    // 4. Projects with normalized INR prices
    @GetMapping("/projects")
    public ResponseEntity<Map<String, Object>> getProjects(
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String project_status,
            @RequestParam(required = false) String sort_by,
            @RequestParam(required = false, defaultValue = "asc") String order,
            @RequestParam(required = false, defaultValue = "20") int limit,
            @RequestParam(required = false, defaultValue = "0") int offset
    ) {
        List<Project> all = ingestionService.getProjects();
        List<Project> filtered = all.stream().filter(p -> {
            if (locality != null && !locality.isBlank()) {
                if (p.getLocality() == null || !p.getLocality().equalsIgnoreCase(locality.trim())) return false;
            }
            if (project_status != null && !project_status.isBlank()) {
                if (p.getProjectStatus() == null || !p.getProjectStatus().equalsIgnoreCase(project_status.trim())) return false;
            }
            return true;
        }).collect(Collectors.toList());

        if ("price_max".equalsIgnoreCase(sort_by)) {
            Comparator<Project> comp = Comparator.comparing(Project::getPriceMaxInr);
            if ("desc".equalsIgnoreCase(order)) comp = comp.reversed();
            filtered.sort(comp);
        } else if ("price_min".equalsIgnoreCase(sort_by)) {
            Comparator<Project> comp = Comparator.comparing(Project::getPriceMinInr);
            if ("desc".equalsIgnoreCase(order)) comp = comp.reversed();
            filtered.sort(comp);
        }

        int total = filtered.size();
        int safeOffset = Math.min(Math.max(offset, 0), total);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        int safeEnd = Math.min(safeOffset + safeLimit, total);

        List<Project> paged = filtered.subList(safeOffset, safeEnd);

        Map<String, Object> response = new HashMap<>();
        response.put("limit", safeLimit);
        response.put("offset", safeOffset);
        response.put("count", paged.size());
        response.put("total", total);
        response.put("has_more", safeEnd < total);
        response.put("results", paged);

        return ResponseEntity.ok(response);
    }

    // 5. Analytics Aggregate Screen Data
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Listing> listings = ingestionService.getListings();
        List<Rental> rentals = ingestionService.getRentals();
        List<Project> projects = ingestionService.getProjects();

        List<Long> livePrices = listings.stream()
                .filter(l -> Boolean.TRUE.equals(l.getIsLive()) && l.getPrice() != null && l.getPrice() > 0)
                .map(Listing::getPrice)
                .sorted()
                .collect(Collectors.toList());

        long medianPrice = 0;
        if (!livePrices.isEmpty()) {
            medianPrice = livePrices.get(livePrices.size() / 2);
        }

        Map<String, Long> localityCounts = listings.stream()
                .filter(l -> l.getLocality() != null)
                .collect(Collectors.groupingBy(l -> l.getLocality().toLowerCase(), Collectors.counting()));

        Map<Integer, Long> bhkCounts = listings.stream()
                .filter(l -> l.getBedroom() != null)
                .collect(Collectors.groupingBy(Listing::getBedroom, Collectors.counting()));

        Map<String, Object> result = new HashMap<>();
        result.put("city", "hyderabad");
        result.put("total_listings", listings.size());
        result.put("active_listings", listings.stream().filter(l -> Boolean.TRUE.equals(l.getIsLive())).count());
        result.put("total_rentals", rentals.size());
        result.put("total_projects", projects.size());
        result.put("median_price", medianPrice);
        result.put("by_locality", localityCounts);
        result.put("by_bhk", bhkCounts);

        return ResponseEntity.ok(result);
    }

    // 6. Full Audit Report & Submission Payload for Dashboard
    @GetMapping("/audit-summary")
    public ResponseEntity<SubmissionPayload> getAuditSummary() {
        SubmissionPayload submission = submissionGeneratorService.generateSubmission();
        return ResponseEntity.ok(submission);
    }
}
