package com.ivy.assignment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Listing {
    @JsonProperty("listing_id")
    private String listingId;

    @JsonProperty("listing_url")
    private String listingUrl;

    @JsonProperty("website")
    private String website;

    @JsonProperty("city_id")
    private Integer cityId;

    @JsonProperty("apartment_name")
    private String apartmentName;

    @JsonProperty("locality")
    private String locality;

    @JsonProperty("property_type")
    private String propertyType;

    @JsonProperty("bedroom")
    private Integer bedroom;

    @JsonProperty("bathroom")
    private Integer bathroom;

    @JsonProperty("balcony")
    private Integer balcony;

    @JsonProperty("floor")
    private Integer floor;

    @JsonProperty("total_floors")
    private Integer totalFloors;

    @JsonProperty("furnishing")
    private String furnishing;

    @JsonProperty("facing_direction")
    private String facingDirection;

    @JsonProperty("covered_parking")
    private Integer coveredParking;

    @JsonProperty("price")
    private Long price;

    @JsonProperty("carpet_area")
    private Double carpetArea;

    @JsonProperty("super_built_up_area")
    private Double superBuiltUpArea;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("posted_by")
    private String postedBy;

    @JsonProperty("posted_by_name")
    private String postedByName;

    @JsonProperty("posted_by_contact")
    private String postedByContact;

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("is_verified")
    private Boolean isVerified;

    @JsonProperty("description")
    private String description;

    @JsonProperty("posted_at")
    private String postedAt;

    @JsonProperty("is_live")
    private Boolean isLive;

    public Listing() {}

    public String getListingId() { return listingId; }
    public void setListingId(String listingId) { this.listingId = listingId; }

    public String getListingUrl() { return listingUrl; }
    public void setListingUrl(String listingUrl) { this.listingUrl = listingUrl; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public Integer getBedroom() { return bedroom; }
    public void setBedroom(Integer bedroom) { this.bedroom = bedroom; }

    public Integer getBathroom() { return bathroom; }
    public void setBathroom(Integer bathroom) { this.bathroom = bathroom; }

    public Integer getBalcony() { return balcony; }
    public void setBalcony(Integer balcony) { this.balcony = balcony; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public Integer getTotalFloors() { return totalFloors; }
    public void setTotalFloors(Integer totalFloors) { this.totalFloors = totalFloors; }

    public String getFurnishing() { return furnishing; }
    public void setFurnishing(String furnishing) { this.furnishing = furnishing; }

    public String getFacingDirection() { return facingDirection; }
    public void setFacingDirection(String facingDirection) { this.facingDirection = facingDirection; }

    public Integer getCoveredParking() { return coveredParking; }
    public void setCoveredParking(Integer coveredParking) { this.coveredParking = coveredParking; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Double getCarpetArea() { return carpetArea; }
    public void setCarpetArea(Double carpetArea) { this.carpetArea = carpetArea; }

    public Double getSuperBuiltUpArea() { return superBuiltUpArea; }
    public void setSuperBuiltUpArea(Double superBuiltUpArea) { this.superBuiltUpArea = superBuiltUpArea; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }

    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }

    public String getPostedByContact() { return postedByContact; }
    public void setPostedByContact(String postedByContact) { this.postedByContact = postedByContact; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }

    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }
}
