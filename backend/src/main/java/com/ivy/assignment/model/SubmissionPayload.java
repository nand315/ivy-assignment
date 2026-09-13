package com.ivy.assignment.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class SubmissionPayload {
    @JsonProperty("api_key")
    private String apiKey;

    @JsonProperty("candidate")
    private Candidate candidate = new Candidate();

    @JsonProperty("answers")
    private Answers answers = new Answers();

    @JsonProperty("findings")
    private List<Finding> findings = new ArrayList<>();

    public SubmissionPayload() {}

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }

    public Answers getAnswers() { return answers; }
    public void setAnswers(Answers answers) { this.answers = answers; }

    public List<Finding> getFindings() { return findings; }
    public void setFindings(List<Finding> findings) { this.findings = findings; }

    public static class Candidate {
        @JsonProperty("name")
        private String name = "Nandlal Gupta";

        @JsonProperty("email")
        private String email = "nandlal.2023ca062@mnnit.ac.in";

        @JsonProperty("repo_url")
        private String repoUrl = "https://github.com/nand315/ivy-assignment";

        @JsonProperty("demo_url")
        private String demoUrl = "http://localhost:5173";

        public Candidate() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRepoUrl() { return repoUrl; }
        public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }

        public String getDemoUrl() { return demoUrl; }
        public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }
    }

    public static class Answers {
        @JsonProperty("total_listing_records")
        private Integer totalListingRecords;

        @JsonProperty("unique_properties")
        private Integer uniqueProperties;

        @JsonProperty("active_listings")
        private Integer activeListings;

        @JsonProperty("corrupt_listing_ids")
        private List<String> corruptListingIds = new ArrayList<>();

        @JsonProperty("total_monthly_rent")
        private Long totalMonthlyRent;

        @JsonProperty("avg_price_per_sqft_2bhk")
        private Double avgPricePerSqft2bhk;

        @JsonProperty("costliest_project")
        private CostliestProject costliestProject = new CostliestProject();

        @JsonProperty("listings_last_7_days")
        private Integer listingsLast7Days;

        @JsonProperty("fake_listing_ids")
        private List<String> fakeListingIds = new ArrayList<>();

        @JsonProperty("projects_with_wrong_listing_count")
        private Integer projectsWithWrongListingCount;

        public Answers() {}

        public Integer getTotalListingRecords() { return totalListingRecords; }
        public void setTotalListingRecords(Integer totalListingRecords) { this.totalListingRecords = totalListingRecords; }

        public Integer getUniqueProperties() { return uniqueProperties; }
        public void setUniqueProperties(Integer uniqueProperties) { this.uniqueProperties = uniqueProperties; }

        public Integer getActiveListings() { return activeListings; }
        public void setActiveListings(Integer activeListings) { this.activeListings = activeListings; }

        public List<String> getCorruptListingIds() { return corruptListingIds; }
        public void setCorruptListingIds(List<String> corruptListingIds) { this.corruptListingIds = corruptListingIds; }

        public Long getTotalMonthlyRent() { return totalMonthlyRent; }
        public void setTotalMonthlyRent(Long totalMonthlyRent) { this.totalMonthlyRent = totalMonthlyRent; }

        public Double getAvgPricePerSqft2bhk() { return avgPricePerSqft2bhk; }
        public void setAvgPricePerSqft2bhk(Double avgPricePerSqft2bhk) { this.avgPricePerSqft2bhk = avgPricePerSqft2bhk; }

        public CostliestProject getCostliestProject() { return costliestProject; }
        public void setCostliestProject(CostliestProject costliestProject) { this.costliestProject = costliestProject; }

        public Integer getListingsLast7Days() { return listingsLast7Days; }
        public void setListingsLast7Days(Integer listingsLast7Days) { this.listingsLast7Days = listingsLast7Days; }

        public List<String> getFakeListingIds() { return fakeListingIds; }
        public void setFakeListingIds(List<String> fakeListingIds) { this.fakeListingIds = fakeListingIds; }

        public Integer getProjectsWithWrongListingCount() { return projectsWithWrongListingCount; }
        public void setProjectsWithWrongListingCount(Integer projectsWithWrongListingCount) { this.projectsWithWrongListingCount = projectsWithWrongListingCount; }
    }

    public static class CostliestProject {
        @JsonProperty("project_id")
        private String projectId;

        @JsonProperty("price_max_inr")
        private Long priceMaxInr;

        public CostliestProject() {}
        public CostliestProject(String projectId, Long priceMaxInr) {
            this.projectId = projectId;
            this.priceMaxInr = priceMaxInr;
        }

        public String getProjectId() { return projectId; }
        public void setProjectId(String projectId) { this.projectId = projectId; }

        public Long getPriceMaxInr() { return priceMaxInr; }
        public void setPriceMaxInr(Long priceMaxInr) { this.priceMaxInr = priceMaxInr; }
    }
}
