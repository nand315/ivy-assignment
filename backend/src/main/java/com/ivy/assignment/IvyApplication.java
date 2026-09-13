package com.ivy.assignment;

import com.ivy.assignment.service.DataIngestionService;
import com.ivy.assignment.service.SubmissionGeneratorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IvyApplication implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(IvyApplication.class);

    private final DataIngestionService ingestionService;
    private final SubmissionGeneratorService submissionGeneratorService;

    public IvyApplication(DataIngestionService ingestionService,
                          SubmissionGeneratorService submissionGeneratorService) {
        this.ingestionService = ingestionService;
        this.submissionGeneratorService = submissionGeneratorService;
    }

    public static void main(String[] args) {
        SpringApplication.run(IvyApplication.class, args);
    }

    @Override
    public void run(String... args) {
        log.info("Starting Ivy Homes Ingestion & Audit Pipeline on startup...");
        ingestionService.ingestAllData();
        submissionGeneratorService.generateSubmission();
        log.info("Ivy Homes Ingestion & Audit Pipeline successfully executed!");
        log.info("Local API Service ready on http://localhost:8080");
    }
}
