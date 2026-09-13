package com.ivy.assignment.service;

import com.ivy.assignment.client.IvyApiClient;
import com.ivy.assignment.model.Listing;
import com.ivy.assignment.model.Project;
import com.ivy.assignment.model.Rental;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DataIngestionService {
    private static final Logger log = LoggerFactory.getLogger(DataIngestionService.class);

    private final IvyApiClient apiClient;
    private final List<Listing> listingsStore = new CopyOnWriteArrayList<>();
    private final List<Rental> rentalsStore = new CopyOnWriteArrayList<>();
    private final List<Project> projectsStore = new CopyOnWriteArrayList<>();

    private volatile boolean ingested = false;

    public DataIngestionService(IvyApiClient apiClient) {
        this.apiClient = apiClient;
    }

    public synchronized void ingestAllData() {
        if (ingested) {
            log.info("Data already ingested ({} listings, {} rentals, {} projects)",
                    listingsStore.size(), rentalsStore.size(), projectsStore.size());
            return;
        }

        log.info("=== Starting Complete Ingestion of Ivy Homes Property Datasets ===");

        // 1. Fetch Listings
        List<Listing> listings = apiClient.fetchAllListings();
        listingsStore.clear();
        listingsStore.addAll(listings);

        // 2. Fetch Rentals
        List<Rental> rentals = apiClient.fetchAllRentals();
        rentalsStore.clear();
        rentalsStore.addAll(rentals);

        // 3. Fetch Projects
        List<Project> projects = apiClient.fetchAllProjects();
        projectsStore.clear();
        projectsStore.addAll(projects);

        ingested = true;
        log.info("=== Data Ingestion Complete: {} Listings, {} Rentals, {} Projects ===",
                listingsStore.size(), rentalsStore.size(), projectsStore.size());
    }

    public List<Listing> getListings() {
        if (!ingested) ingestAllData();
        return Collections.unmodifiableList(listingsStore);
    }

    public List<Rental> getRentals() {
        if (!ingested) ingestAllData();
        return Collections.unmodifiableList(rentalsStore);
    }

    public List<Project> getProjects() {
        if (!ingested) ingestAllData();
        return Collections.unmodifiableList(projectsStore);
    }

    public boolean isIngested() {
        return ingested;
    }
}
