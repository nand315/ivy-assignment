package com.ivy.assignment.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class Finding {
    @JsonProperty("endpoint")
    private String endpoint;

    @JsonProperty("category")
    private String category;

    @JsonProperty("documented")
    private String documented;

    @JsonProperty("actual")
    private String actual;

    @JsonProperty("how_found")
    private String howFound;

    @JsonProperty("impact")
    private String impact;

    @JsonProperty("evidence")
    private List<String> evidence = new ArrayList<>();

    public Finding() {}

    public Finding(String endpoint, String category, String documented, String actual, String howFound, String impact, List<String> evidence) {
        this.endpoint = endpoint;
        this.category = category;
        this.documented = documented;
        this.actual = actual;
        this.howFound = howFound;
        this.impact = impact;
        this.evidence = evidence != null ? evidence : new ArrayList<>();
    }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDocumented() { return documented; }
    public void setDocumented(String documented) { this.documented = documented; }

    public String getActual() { return actual; }
    public void setActual(String actual) { this.actual = actual; }

    public String getHowFound() { return howFound; }
    public void setHowFound(String howFound) { this.howFound = howFound; }

    public String getImpact() { return impact; }
    public void setImpact(String impact) { this.impact = impact; }

    public List<String> getEvidence() { return evidence; }
    public void setEvidence(List<String> evidence) { this.evidence = evidence; }
}
