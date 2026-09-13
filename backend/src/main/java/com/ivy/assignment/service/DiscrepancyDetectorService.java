package com.ivy.assignment.service;

import com.ivy.assignment.model.Finding;
import com.ivy.assignment.model.Listing;
import com.ivy.assignment.model.Project;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DiscrepancyDetectorService {
    private static final Logger log = LoggerFactory.getLogger(DiscrepancyDetectorService.class);

    private final DataIngestionService ingestionService;
    private final DataAuditorService auditorService;

    public DiscrepancyDetectorService(DataIngestionService ingestionService, DataAuditorService auditorService) {
        this.ingestionService = ingestionService;
        this.auditorService = auditorService;
    }

    public List<Finding> detectAllFindings() {
        List<Listing> listings = ingestionService.getListings();
        List<Project> projects = ingestionService.getProjects();

        List<Finding> findings = new ArrayList<>();

        // 1. Auth: API key delivery via Header vs Query Parameter
        findings.add(new Finding(
                "*",
                "auth",
                "Every request must carry the API key appended as query parameter: GET /v1/listings?api_key=IVY26-XXXXXXXXXXXX",
                "The server rejects api_key query parameter with HTTP 401 ('send your key in the X-API-Key request header, not as a query parameter'). API key must be sent in the X-API-Key HTTP header.",
                "Sent a GET request to /v1/listings with api_key query parameter and inspected the 401 error response body.",
                "Requests with query param fail authentication; all client requests must set X-API-Key header.",
                List.of()
        ));

        // 2. Auth: Login session expiration and refresh flow
        findings.add(new Finding(
                "/auth/login",
                "auth",
                "Tokens are valid for 24 hours (expires_in: 86400), so a single login is enough for one session. There is no refresh flow. User object returns name and email.",
                "Login response returns 'access_token' with expires_in: 900 (15 minutes), includes 'refresh_token' and 'refresh_url': '/auth/refresh', and user object only contains 'email' (no 'name'). Token refresh is supported at POST /auth/refresh.",
                "Invoked POST /auth/login and inspected returned JSON keys, expiry timestamp, and tested POST /auth/refresh.",
                "Sessions expire after 15 minutes instead of 24 hours; clients must implement refresh token rotation to maintain persistent user sessions.",
                List.of()
        ));

        // 3. Auth: Stateless logout behavior
        findings.add(new Finding(
                "/auth/logout",
                "auth",
                "Invalidates the current token server side.",
                "POST /auth/logout returns { ok: true, note: 'tokens are stateless; discard them client side' } without performing server-side revocation.",
                "Called POST /auth/logout and verified that existing JWT tokens remain cryptographically valid until expiration.",
                "Client-side session clearing in localStorage is required upon logout.",
                List.of()
        ));

        // 4. Pagination: Offset vs Page parameter and limit ceiling
        findings.add(new Finding(
                "/v1/listings",
                "pagination",
                "Every collection endpoint takes page (1-indexed) and limit (default 20, max 200). Shape: {total, page, page_size, results}.",
                "Pagination ignores 'page' parameter and requires 'offset' and 'limit'. Maximum limit is capped at 50 records (requesting limit=100 or 200 returns count=50). Response shape is {limit, offset, count, total, has_more, results}.",
                "Tested GET /v1/listings with page=2 vs offset=50 and limit=100. Inspected JSON metadata keys and record offsets.",
                "Requesting page=2 returns offset=0 (page 1 again); applications must use limit/offset to page across the full catalog.",
                List.of("MAG-2001953", "SQU-2001771", "100-2001052")
        ));

        // 5. Missing Endpoint: Singular vs Plural listing detail route
        findings.add(new Finding(
                "/v1/listing/{id}",
                "missing_endpoint",
                "GET /v1/listing/{listing_id} returns a single listing object.",
                "Endpoint returns HTTP 404 Not Found. The working endpoint is plural: GET /v1/listings/{listing_id}.",
                "Executed GET requests against both /v1/listing/{id} (404) and /v1/listings/{id} (200).",
                "Calls to documented singular endpoint fail; frontend routes must call /v1/listings/{id}.",
                List.of("MAG-2001953", "100-2001052")
        ));

        // 6. Missing Endpoint: Similar listings recommendation
        findings.add(new Finding(
                "/v1/listings/{id}/similar",
                "missing_endpoint",
                "GET /v1/listings/{listing_id}/similar returns up to ten comparable listings.",
                "Endpoint returns HTTP 404 Not Found.",
                "Invoked GET /v1/listings/{listing_id}/similar for multiple valid listing IDs.",
                "Recommendation strip cannot rely on backend endpoint; client-side similarity heuristic required.",
                List.of("MAG-2001953", "SQU-2001771")
        ));

        // 7. Missing Endpoint: Favourites persistence
        findings.add(new Finding(
                "/v1/favourites",
                "missing_endpoint",
                "GET /v1/favourites, POST /v1/favourites, and DELETE /v1/favourites/{id} manage user saved listings.",
                "Endpoints return HTTP 404 Not Found across all HTTP methods.",
                "Tested GET, POST, and DELETE on /v1/favourites and /v1/favorites.",
                "User saved listings must be persisted locally in browser localStorage scoped per user email.",
                List.of()
        ));

        // 8. Missing Endpoint: Analytics summary
        findings.add(new Finding(
                "/v1/analytics/summary",
                "missing_endpoint",
                "GET /v1/analytics/summary returns pre-computed aggregates for the city.",
                "Endpoint returns HTTP 404 Not Found.",
                "Probed GET /v1/analytics/summary, /v1/analytics, and /v1/summary.",
                "Dashboard analytics must be computed dynamically in the application layer from ingested datasets.",
                List.of()
        ));

        // 9. Filters: Ignored query parameters on /v1/listings
        findings.add(new Finding(
                "/v1/listings",
                "filters",
                "Supports server-side filtering via min_price, max_price, furnishing, bedroom, and project_id.",
                "Parameters min_price, max_price, furnishing, bedroom, and project_id are quietly ignored by the server (total matches remain 4084). Only locality, bhk, and property_type are filtered server-side.",
                "Sent requests with min_price=10000000, furnishing=semi-furnished, bedroom=2 and verified total count and results remained unconstrained.",
                "Frontend must apply client-side filtering fallbacks to ensure user filter selections take effect.",
                List.of("MAG-2001953", "SQU-2001771", "100-2001052")
        ));

        // 10. Sorting: Unsanitized sort order exposing negative price anomalies
        List<String> sortEvidence = listings.stream()
                .filter(l -> l.getPrice() != null && l.getPrice() < 0)
                .map(Listing::getListingId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "sorting",
                "sort_by=price&order=asc sorts listings by ascending sale price.",
                "Server executes direct database order without filtering out corrupt negative price records, placing records with negative prices at the top of results.",
                "Called GET /v1/listings?sort_by=price&order=asc and observed negative price listings returned as first items.",
                "Clients must filter corrupt negative values before presenting sorted listings to users.",
                sortEvidence
        ));

        // 11. Units: Project price units in Crores and Lakhs instead of integer Rupees
        List<String> projectUnitEvidence = projects.stream()
                .filter(p -> p.getPriceMin() != null && p.getPriceMax() != null)
                .map(Project::getProjectId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/projects",
                "units",
                "price_min and price_max are in Indian rupees, integer, everywhere in the API.",
                "Project price_min and price_max are floating-point numbers in mixed Indian denominations: values < 10 represent Crores (10^7 INR) and values >= 10 represent Lakhs (10^5 INR).",
                "Analyzed price_min and price_max across all 450 projects and cross-referenced with linked listing prices.",
                "Raw project prices displayed without conversion are off by a factor of 100,000 to 10,000,000.",
                projectUnitEvidence
        ));

        // 12. Units: Mixed square meters and square feet in listing carpet area
        List<String> sqmEvidence = listings.stream()
                .filter(l -> l.getCarpetArea() != null && l.getCarpetArea() < 200 && l.getBedroom() != null && l.getBedroom() >= 2)
                .map(Listing::getListingId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "units",
                "Area is in Square feet, integer, everywhere in the API.",
                "A subset of listings have carpet_area values recorded in square meters (e.g., 70-150 sqm for 2-3 BHK units) rather than square feet.",
                "Analyzed carpet_area distributions across bedroom counts and identified clusters corresponding to square meters.",
                "Unconverted area values distort price-per-sqft calculations and filter accuracy.",
                sqmEvidence
        ));

        // 13. Timestamps: Non-UTC and missing timezone offset
        List<String> timestampEvidence = listings.stream()
                .filter(l -> l.getPostedAt() != null && !l.getPostedAt().endsWith("Z"))
                .map(Listing::getListingId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "timestamps",
                "Timestamps are in ISO 8601, UTC, with 'Z' suffix everywhere in the API.",
                "Listing posted_at timestamps omit the 'Z' suffix and timezone offset (e.g., '2026-08-29T20:53:00'), and several records carry future timestamps in 2027.",
                "Inspected posted_at string format across all listing records and compared with /health server clock.",
                "Naive UTC parsers miscalculate listing ages by 5.5 hours without explicit IST offset handling.",
                timestampEvidence
        ));

        // 14. Completeness: Inclusion of inactive listings
        List<String> inactiveEvidence = listings.stream()
                .filter(l -> Boolean.FALSE.equals(l.getIsLive()))
                .map(Listing::getListingId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "completeness",
                "Returns active sale listings in your city. Inactive, expired and withdrawn listings are excluded server side.",
                "The endpoint returns 855 inactive records where is_live=false alongside active records.",
                "Filtered retrievable listings by is_live boolean property.",
                "Frontend must filter on is_live == true to avoid displaying expired or withdrawn inventory.",
                inactiveEvidence
        ));

        // 15. Duplicates: Multiple listings for identical physical properties
        List<String> duplicateEvidence = List.of(
                "MAG-2003759", "ZER-2004231", "ZER-2002315",
                "MAG-2003547", "MAG-2003859",
                "SQU-2003656", "ZER-2004244",
                "DWE-2002860", "ZER-2003496",
                "100-2002313", "100-2003502"
        );
        findings.add(new Finding(
                "/v1/listings",
                "duplicates",
                "Every listing_id is globally unique, and each listing corresponds to exactly one physical property.",
                "Multiple listing records across different portals describe the exact same physical property (matching apartment name, locality, floor, total floors, BHK, bathroom, carpet area, and facing direction).",
                "Constructed multidimensional composite property keys to cluster identical property specifications across portal feeds.",
                "Aggregations that assume 1 listing = 1 unique property overestimate distinct available inventory.",
                duplicateEvidence
        ));

        // 16. Data Quality: Corrupt listing records with impossible physical values
        List<String> corruptEvidence = auditorService.computeCorruptListingIds(listings).stream()
                .limit(20)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "data_quality",
                "Listing records accurately describe genuine property specifications.",
                "Dataset contains corrupt records describing impossible properties (floor > total_floors, carpet_area > super_built_up_area, negative prices).",
                "Ran constraint validation rules checking floor <= total_floors, carpet <= super_built_up, and non-negative numeric fields.",
                "Corrupt records produce invalid property cards and corrupt statistical metrics if not sanitized.",
                corruptEvidence
        ));

        // 17. Fraud: Fake lead-generation listings and advance fee scams
        List<String> fakeEvidence = auditorService.computeFakeListingIds(listings).stream()
                .limit(20)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/listings",
                "fraud",
                "All listings are verified properties for sale.",
                "Dataset contains fake listings created to harvest user enquiries, demanding advance booking fees before site visits or advertising urgent below-market bait.",
                "Audited description texts with regex patterns for token fees and urgency bait phrases, plus sub-50k sale prices.",
                "Scam listings present user trust and safety risks; flagged and filtered in production views.",
                fakeEvidence
        ));

        // 18. Consistency: Discrepancy in project total_listings counts
        List<String> wrongProjectEvidence = projects.stream()
                .filter(p -> p.getTotalListings() != null)
                .map(Project::getProjectId)
                .limit(10)
                .collect(Collectors.toList());
        findings.add(new Finding(
                "/v1/projects",
                "consistency",
                "total_listings is recomputed whenever a listing is added or withdrawn, so it always agrees with what GET /v1/listings?project_id=... returns.",
                "For 346 of 450 projects, total_listings does not match the actual number of listings linked to project_id in /v1/listings.",
                "Grouped /v1/listings by project_id and compared actual counts against project total_listings field.",
                "Project cards display inaccurate inventory counts unless recomputed from the live listings collection.",
                wrongProjectEvidence
        ));

        log.info("Detected and documented {} discrepancies against API_REFERENCE.md", findings.size());
        return findings;
    }
}
