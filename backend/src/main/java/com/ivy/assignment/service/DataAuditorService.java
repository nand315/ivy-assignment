package com.ivy.assignment.service;

import com.ivy.assignment.model.Listing;
import com.ivy.assignment.model.Project;
import com.ivy.assignment.model.Rental;
import com.ivy.assignment.model.SubmissionPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class DataAuditorService {
    private static final Logger log = LoggerFactory.getLogger(DataAuditorService.class);

    private final DataIngestionService ingestionService;

    // Fixed reference moment from problem statement: 2026-09-10T00:00:00+05:30 (IST)
    private static final OffsetDateTime REFERENCE = OffsetDateTime.of(2026, 9, 10, 0, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30));
    private static final OffsetDateTime REFERENCE_MINUS_7 = REFERENCE.minusDays(7);

    // Regex patterns for fake listing detection (lead generation scams and urgency bait)
    private static final Pattern TOKEN_SCAM_PATTERN = Pattern.compile(
            "token\\s+amount|booking\\s+amount|site\\s+visit\\s+only\\s+after", Pattern.CASE_INSENSITIVE);
    private static final Pattern BELOW_MARKET_PATTERN = Pattern.compile(
            "below\\s+market\\s+price,\\s*this\\s+week\\s+only", Pattern.CASE_INSENSITIVE);

    public DataAuditorService(DataIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    public SubmissionPayload.Answers computeAllAnswers() {
        List<Listing> listings = ingestionService.getListings();
        List<Rental> rentals = ingestionService.getRentals();
        List<Project> projects = ingestionService.getProjects();

        SubmissionPayload.Answers answers = new SubmissionPayload.Answers();

        // 1. total_listing_records
        int totalListings = listings.size();
        answers.setTotalListingRecords(totalListings);

        // 3. active_listings (is_live == true)
        int activeCount = (int) listings.stream()
                .filter(l -> Boolean.TRUE.equals(l.getIsLive()))
                .count();
        answers.setActiveListings(activeCount);

        // 4. corrupt_listing_ids (Physical impossibilities)
        List<String> corruptIds = computeCorruptListingIds(listings);
        answers.setCorruptListingIds(corruptIds);
        Set<String> corruptSet = new HashSet<>(corruptIds);

        // 9. fake_listing_ids (Fraudulent / Lead Gen / Advance Fee)
        List<String> fakeIds = computeFakeListingIds(listings);
        answers.setFakeListingIds(fakeIds);
        Set<String> fakeSet = new HashSet<>(fakeIds);

        // 2. unique_properties
        int uniqueProps = computeUniqueProperties(listings);
        answers.setUniqueProperties(uniqueProps);

        // 5. total_monthly_rent (assigned locality: Madhapur)
        long totalMadhapurRent = rentals.stream()
                .filter(r -> r.getLocality() != null && "madhapur".equalsIgnoreCase(r.getLocality().trim()))
                .mapToLong(r -> r.getPrice() != null ? r.getPrice() : 0L)
                .sum();
        answers.setTotalMonthlyRent(totalMadhapurRent);

        // 6. avg_price_per_sqft_2bhk
        double avgPricePerSqft = computeAvgPricePerSqft2BHK(listings, corruptSet, fakeSet);
        answers.setAvgPricePerSqft2bhk(avgPricePerSqft);

        // 7. costliest_project
        SubmissionPayload.CostliestProject costliest = computeCostliestProject(projects);
        answers.setCostliestProject(costliest);

        // 8. listings_last_7_days in [REFERENCE - 7 days, REFERENCE) IST
        int last7DaysCount = computeListingsLast7Days(listings);
        answers.setListingsLast7Days(last7DaysCount);

        // 10. projects_with_wrong_listing_count
        int wrongCount = computeProjectsWithWrongListingCount(projects, listings);
        answers.setProjectsWithWrongListingCount(wrongCount);

        logAuditSummary(answers);
        return answers;
    }

    public List<String> computeCorruptListingIds(List<Listing> listings) {
        Set<String> corrupt = new TreeSet<>();
        for (Listing l : listings) {
            boolean isCorrupt = false;

            // Condition A: Floor exceeds total floors in building
            if (l.getFloor() != null && l.getTotalFloors() != null && l.getFloor() > l.getTotalFloors()) {
                isCorrupt = true;
            }

            // Condition B: Carpet area exceeds super built-up area
            if (l.getCarpetArea() != null && l.getSuperBuiltUpArea() != null && l.getCarpetArea() > l.getSuperBuiltUpArea()) {
                isCorrupt = true;
            }

            // Condition C: Negative price or area values
            if (l.getPrice() != null && l.getPrice() < 0) {
                isCorrupt = true;
            }
            if (l.getCarpetArea() != null && l.getCarpetArea() < 0) {
                isCorrupt = true;
            }
            if (l.getSuperBuiltUpArea() != null && l.getSuperBuiltUpArea() < 0) {
                isCorrupt = true;
            }
            if (l.getBedroom() != null && l.getBedroom() < 0) {
                isCorrupt = true;
            }
            if (l.getBathroom() != null && l.getBathroom() < 0) {
                isCorrupt = true;
            }

            if (isCorrupt) {
                corrupt.add(l.getListingId());
            }
        }
        return new ArrayList<>(corrupt);
    }

    public List<String> computeFakeListingIds(List<Listing> listings) {
        Set<String> fake = new TreeSet<>();
        for (Listing l : listings) {
            String desc = l.getDescription() != null ? l.getDescription() : "";

            // Condition A: Advance token payment or booking fee scam
            if (TOKEN_SCAM_PATTERN.matcher(desc).find()) {
                fake.add(l.getListingId());
                continue;
            }

            // Condition B: Urgent sale with "Below market price, this week only" honeypot text
            if (BELOW_MARKET_PATTERN.matcher(desc).find()) {
                fake.add(l.getListingId());
                continue;
            }

            // Condition C: Positive price that is absurdly low (< 50,000 INR for full property sale)
            if (l.getPrice() != null && l.getPrice() > 0 && l.getPrice() < 50_000L) {
                fake.add(l.getListingId());
            }
        }
        return new ArrayList<>(fake);
    }

    public int computeUniqueProperties(List<Listing> listings) {
        // Properties are uniquely identified by physical characteristics:
        // apartment name, locality, floor, total floors, bedroom, bathroom, carpet area, facing direction
        Set<String> propertyClusters = new HashSet<>();
        for (Listing l : listings) {
            String apt = (l.getApartmentName() != null ? l.getApartmentName().toLowerCase().replaceAll("[^a-z0-9]", "") : "");
            String loc = (l.getLocality() != null ? l.getLocality().toLowerCase().replaceAll("[^a-z0-9]", "") : "");
            int floor = l.getFloor() != null ? l.getFloor() : -1;
            int totalFloors = l.getTotalFloors() != null ? l.getTotalFloors() : -1;
            int bhk = l.getBedroom() != null ? l.getBedroom() : 0;
            int bath = l.getBathroom() != null ? l.getBathroom() : 0;
            double area = l.getCarpetArea() != null ? l.getCarpetArea() : 0.0;
            String facing = l.getFacingDirection() != null ? l.getFacingDirection().toLowerCase().trim() : "";

            String fingerprint = String.format("%s|%s|%d|%d|%d|%d|%.1f|%s",
                    apt, loc, floor, totalFloors, bhk, bath, area, facing);
            propertyClusters.add(fingerprint);
        }
        return propertyClusters.size();
    }

    public double computeAvgPricePerSqft2BHK(List<Listing> listings, Set<String> corruptSet, Set<String> fakeSet) {
        List<Double> pricePerSqftValues = new ArrayList<>();

        for (Listing l : listings) {
            if (!Boolean.TRUE.equals(l.getIsLive())) continue;
            if (l.getBedroom() == null || l.getBedroom() != 2) continue;
            if (corruptSet.contains(l.getListingId()) || fakeSet.contains(l.getListingId())) continue;
            if (l.getPrice() == null || l.getCarpetArea() == null || l.getCarpetArea() <= 0) continue;

            double ppsqft = (double) l.getPrice() / l.getCarpetArea();
            pricePerSqftValues.add(ppsqft);
        }

        if (pricePerSqftValues.isEmpty()) return 0.0;
        double sum = pricePerSqftValues.stream().mapToDouble(Double::doubleValue).sum();
        double mean = sum / pricePerSqftValues.size();
        return Math.round(mean * 100.0) / 100.0;
    }

    public SubmissionPayload.CostliestProject computeCostliestProject(List<Project> projects) {
        Project costliest = null;
        long maxInr = -1L;

        for (Project p : projects) {
            long priceInr = p.getPriceMaxInr();
            if (priceInr > maxInr) {
                maxInr = priceInr;
                costliest = p;
            }
        }

        if (costliest != null) {
            return new SubmissionPayload.CostliestProject(costliest.getProjectId(), maxInr);
        }
        return new SubmissionPayload.CostliestProject("", 0L);
    }

    public int computeListingsLast7Days(List<Listing> listings) {
        int count = 0;
        for (Listing l : listings) {
            String postedAtStr = l.getPostedAt();
            if (postedAtStr == null || postedAtStr.isBlank()) continue;

            try {
                OffsetDateTime postedAt;
                if (postedAtStr.endsWith("Z")) {
                    postedAt = OffsetDateTime.parse(postedAtStr).withOffsetSameInstant(ZoneOffset.ofHoursMinutes(5, 30));
                } else if (postedAtStr.contains("+") || postedAtStr.indexOf("-", 10) != -1) {
                    postedAt = OffsetDateTime.parse(postedAtStr).withOffsetSameInstant(ZoneOffset.ofHoursMinutes(5, 30));
                } else {
                    // Implicit IST timezone
                    postedAt = OffsetDateTime.parse(postedAtStr + "+05:30");
                }

                // Range [REFERENCE - 7 days, REFERENCE) in IST
                if (!postedAt.isBefore(REFERENCE_MINUS_7) && postedAt.isBefore(REFERENCE)) {
                    count++;
                }
            } catch (Exception e) {
                log.warn("Could not parse posted_at timestamp: {}", postedAtStr);
            }
        }
        return count;
    }

    public int computeProjectsWithWrongListingCount(List<Project> projects, List<Listing> listings) {
        Map<String, Long> actualCountByProjectId = listings.stream()
                .filter(l -> l.getProjectId() != null && !l.getProjectId().isBlank())
                .collect(Collectors.groupingBy(Listing::getProjectId, Collectors.counting()));

        int wrongCount = 0;
        for (Project p : projects) {
            long actual = actualCountByProjectId.getOrDefault(p.getProjectId(), 0L);
            int reported = p.getTotalListings() != null ? p.getTotalListings() : 0;
            if (reported != (int) actual) {
                wrongCount++;
            }
        }
        return wrongCount;
    }

    private void logAuditSummary(SubmissionPayload.Answers a) {
        log.info("==================================================================");
        log.info("                 IVY HOMES DATA AUDIT RESULTS                     ");
        log.info("==================================================================");
        log.info("1. total_listing_records:             {}", a.getTotalListingRecords());
        log.info("2. unique_properties:                 {}", a.getUniqueProperties());
        log.info("3. active_listings:                   {}", a.getActiveListings());
        log.info("4. corrupt_listing_ids count:         {}", a.getCorruptListingIds().size());
        log.info("5. total_monthly_rent (Madhapur):     INR {}", a.getTotalMonthlyRent());
        log.info("6. avg_price_per_sqft_2bhk:           INR {}/sqft", a.getAvgPricePerSqft2bhk());
        log.info("7. costliest_project:                 {} (INR {})",
                a.getCostliestProject().getProjectId(), a.getCostliestProject().getPriceMaxInr());
        log.info("8. listings_last_7_days:              {}", a.getListingsLast7Days());
        log.info("9. fake_listing_ids count:            {}", a.getFakeListingIds().size());
        log.info("10. projects_with_wrong_listing_count: {}", a.getProjectsWithWrongListingCount());
        log.info("==================================================================");
    }
}
