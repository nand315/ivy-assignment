package com.ivy.assignment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Project {
    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("project_url")
    private String projectUrl;

    @JsonProperty("city_id")
    private Integer cityId;

    @JsonProperty("apartment_name")
    private String apartmentName;

    @JsonProperty("developer_name")
    private String developerName;

    @JsonProperty("locality")
    private String locality;

    @JsonProperty("project_status")
    private String projectStatus;

    @JsonProperty("total_units")
    private Integer totalUnits;

    @JsonProperty("total_towers")
    private Integer totalTowers;

    @JsonProperty("total_floors")
    private Integer totalFloors;

    @JsonProperty("launch_date")
    private String launchDate;

    @JsonProperty("possession_date")
    private String possessionDate;

    @JsonProperty("rera_number")
    private String reraNumber;

    @JsonProperty("min_area_sqft")
    private Double minAreaSqft;

    @JsonProperty("max_area_sqft")
    private Double maxAreaSqft;

    @JsonProperty("total_listings")
    private Integer totalListings;

    @JsonProperty("price_min")
    private Double priceMin;

    @JsonProperty("price_max")
    private Double priceMax;

    @JsonProperty("amenities")
    private List<String> amenities;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    public Project() {}

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectUrl() { return projectUrl; }
    public void setProjectUrl(String projectUrl) { this.projectUrl = projectUrl; }

    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

    public String getDeveloperName() { return developerName; }
    public void setDeveloperName(String developerName) { this.developerName = developerName; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getProjectStatus() { return projectStatus; }
    public void setProjectStatus(String projectStatus) { this.projectStatus = projectStatus; }

    public Integer getTotalUnits() { return totalUnits; }
    public void setTotalUnits(Integer totalUnits) { this.totalUnits = totalUnits; }

    public Integer getTotalTowers() { return totalTowers; }
    public void setTotalTowers(Integer totalTowers) { this.totalTowers = totalTowers; }

    public Integer getTotalFloors() { return totalFloors; }
    public void setTotalFloors(Integer totalFloors) { this.totalFloors = totalFloors; }

    public String getLaunchDate() { return launchDate; }
    public void setLaunchDate(String launchDate) { this.launchDate = launchDate; }

    public String getPossessionDate() { return possessionDate; }
    public void setPossessionDate(String possessionDate) { this.possessionDate = possessionDate; }

    public String getReraNumber() { return reraNumber; }
    public void setReraNumber(String reraNumber) { this.reraNumber = reraNumber; }

    public Double getMinAreaSqft() { return minAreaSqft; }
    public void setMinAreaSqft(Double minAreaSqft) { this.minAreaSqft = minAreaSqft; }

    public Double getMaxAreaSqft() { return maxAreaSqft; }
    public void setMaxAreaSqft(Double maxAreaSqft) { this.maxAreaSqft = maxAreaSqft; }

    public Integer getTotalListings() { return totalListings; }
    public void setTotalListings(Integer totalListings) { this.totalListings = totalListings; }

    public Double getPriceMin() { return priceMin; }
    public void setPriceMin(Double priceMin) { this.priceMin = priceMin; }

    public Double getPriceMax() { return priceMax; }
    public void setPriceMax(Double priceMax) { this.priceMax = priceMax; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    /**
     * Converts raw API price to INR integer.
     * Values < 10 are in Crores (10^7), values >= 10 are in Lakhs (10^5).
     */
    public Long getPriceMinInr() {
        if (priceMin == null) return 0L;
        if (priceMin < 10.0) return Math.round(priceMin * 10_000_000.0);
        return Math.round(priceMin * 100_000.0);
    }

    public Long getPriceMaxInr() {
        if (priceMax == null) return 0L;
        if (priceMax < 10.0) return Math.round(priceMax * 10_000_000.0);
        return Math.round(priceMax * 100_000.0);
    }
}
