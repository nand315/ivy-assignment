package com.ivy.assignment;

import com.ivy.assignment.model.Listing;
import com.ivy.assignment.model.Project;
import com.ivy.assignment.model.SubmissionPayload;
import com.ivy.assignment.service.DataAuditorService;
import com.ivy.assignment.service.DataIngestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DataAuditorServiceTest {

    private DataAuditorService auditorService;

    @BeforeEach
    void setUp() {
        DataIngestionService ingestionService = new DataIngestionService(null);
        auditorService = new DataAuditorService(ingestionService);
    }

    @Test
    void testCorruptListingDetection() {
        Listing l1 = new Listing();
        l1.setListingId("L1");
        l1.setFloor(15);
        l1.setTotalFloors(10); // Floor > totalFloors -> Corrupt

        Listing l2 = new Listing();
        l2.setListingId("L2");
        l2.setCarpetArea(1500.0);
        l2.setSuperBuiltUpArea(1200.0); // Carpet > Super -> Corrupt

        Listing l3 = new Listing();
        l3.setListingId("L3");
        l3.setPrice(-5000000L); // Negative price -> Corrupt

        Listing l4 = new Listing();
        l4.setListingId("L4");
        l4.setFloor(5);
        l4.setTotalFloors(10);
        l4.setCarpetArea(1000.0);
        l4.setSuperBuiltUpArea(1300.0);
        l4.setPrice(10000000L); // Valid

        List<String> corruptIds = auditorService.computeCorruptListingIds(List.of(l1, l2, l3, l4));
        assertEquals(List.of("L1", "L2", "L3"), corruptIds);
    }

    @Test
    void testFakeListingDetection() {
        Listing l1 = new Listing();
        l1.setListingId("F1");
        l1.setDescription("Pay a token amount of Rs 25,000 today to block the unit.");

        Listing l2 = new Listing();
        l2.setListingId("F2");
        l2.setDescription("Below market price, this week only.");

        Listing l3 = new Listing();
        l3.setListingId("F3");
        l3.setPrice(15000L); // Sub-50k sale price -> Fake

        Listing l4 = new Listing();
        l4.setListingId("V4");
        l4.setDescription("Spacious 3 BHK apartment in Banjara Hills.");
        l4.setPrice(12000000L); // Valid

        List<String> fakeIds = auditorService.computeFakeListingIds(List.of(l1, l2, l3, l4));
        assertEquals(List.of("F1", "F2", "F3"), fakeIds);
    }

    @Test
    void testUniquePropertiesClustering() {
        Listing l1 = new Listing();
        l1.setApartmentName("Prestige Greens");
        l1.setLocality("Madhapur");
        l1.setFloor(5);
        l1.setTotalFloors(15);
        l1.setBedroom(2);
        l1.setBathroom(2);
        l1.setCarpetArea(1000.0);
        l1.setFacingDirection("East");

        Listing l2 = new Listing(); // Duplicate on another portal
        l2.setApartmentName("Prestige Greens");
        l2.setLocality("Madhapur");
        l2.setFloor(5);
        l2.setTotalFloors(15);
        l2.setBedroom(2);
        l2.setBathroom(2);
        l2.setCarpetArea(1000.0);
        l2.setFacingDirection("East");

        Listing l3 = new Listing(); // Different unit
        l3.setApartmentName("Prestige Greens");
        l3.setLocality("Madhapur");
        l3.setFloor(6);
        l3.setTotalFloors(15);
        l3.setBedroom(2);
        l3.setBathroom(2);
        l3.setCarpetArea(1000.0);
        l3.setFacingDirection("East");

        int uniqueCount = auditorService.computeUniqueProperties(List.of(l1, l2, l3));
        assertEquals(2, uniqueCount);
    }

    @Test
    void testCostliestProjectInrConversion() {
        Project p1 = new Project();
        p1.setProjectId("P1");
        p1.setPriceMax(99.8); // 99.8 Lakhs = 9,980,000 INR

        Project p2 = new Project();
        p2.setProjectId("P2");
        p2.setPriceMax(4.15); // 4.15 Crores = 41,500,000 INR

        SubmissionPayload.CostliestProject costliest = auditorService.computeCostliestProject(List.of(p1, p2));
        assertEquals("P2", costliest.getProjectId());
        assertEquals(41500000L, costliest.getPriceMaxInr());
    }

    @Test
    void testAvgPricePerSqft2BHKCalculation() {
        Listing l1 = new Listing();
        l1.setListingId("1");
        l1.setIsLive(true);
        l1.setBedroom(2);
        l1.setPrice(10000000L);
        l1.setCarpetArea(1000.0); // 10,000 / sqft

        Listing l2 = new Listing();
        l2.setListingId("2");
        l2.setIsLive(true);
        l2.setBedroom(2);
        l2.setPrice(12000000L);
        l2.setCarpetArea(1000.0); // 12,000 / sqft

        Listing l3 = new Listing(); // Inactive -> excluded
        l3.setListingId("3");
        l3.setIsLive(false);
        l3.setBedroom(2);
        l3.setPrice(5000000L);
        l3.setCarpetArea(1000.0);

        double avg = auditorService.computeAvgPricePerSqft2BHK(List.of(l1, l2, l3), Set.of(), Set.of());
        assertEquals(11000.0, avg);
    }
}
