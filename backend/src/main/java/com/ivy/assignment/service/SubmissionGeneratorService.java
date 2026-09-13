package com.ivy.assignment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.ivy.assignment.client.IvyApiClient;
import com.ivy.assignment.model.Finding;
import com.ivy.assignment.model.SubmissionPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class SubmissionGeneratorService {
    private static final Logger log = LoggerFactory.getLogger(SubmissionGeneratorService.class);

    private final IvyApiClient apiClient;
    private final DataAuditorService auditorService;
    private final DiscrepancyDetectorService discrepancyDetectorService;
    private final ObjectMapper objectMapper;

    @Value("${submission.output.path:../submission.json}")
    private String submissionOutputPath = "../submission.json";

    public SubmissionGeneratorService(IvyApiClient apiClient,
                                      DataAuditorService auditorService,
                                      DiscrepancyDetectorService discrepancyDetectorService,
                                      ObjectMapper objectMapper) {
        this.apiClient = apiClient;
        this.auditorService = auditorService;
        this.discrepancyDetectorService = discrepancyDetectorService;
        this.objectMapper = objectMapper;
    }

    public SubmissionPayload generateSubmission() {
        log.info("Generating submission payload...");

        SubmissionPayload payload = new SubmissionPayload();
        payload.setApiKey(apiClient.getApiKey());

        // Set Candidate details
        SubmissionPayload.Candidate candidate = new SubmissionPayload.Candidate();
        candidate.setName("Nandlal Gupta");
        candidate.setEmail("nandlal.2023ca062@mnnit.ac.in");
        candidate.setRepoUrl("https://github.com/nandlalgupta/ivy-assignment");
        candidate.setDemoUrl("http://localhost:5173");
        payload.setCandidate(candidate);

        // Compute 10 answers
        SubmissionPayload.Answers answers = auditorService.computeAllAnswers();
        payload.setAnswers(answers);

        // Detect all discrepancies
        List<Finding> findings = discrepancyDetectorService.detectAllFindings();
        payload.setFindings(findings);

        // Write to submission.json
        writeSubmissionToFile(payload);

        return payload;
    }

    private void writeSubmissionToFile(SubmissionPayload payload) {
        try {
            ObjectMapper prettyMapper = objectMapper.copy().enable(SerializationFeature.INDENT_OUTPUT);

            // Write to both workspace root submission.json and current working directory
            Path rootPath = Paths.get("..", "submission.json").toAbsolutePath().normalize();
            File rootFile = rootPath.toFile();
            prettyMapper.writeValue(rootFile, payload);
            log.info("Successfully wrote submission.json to: {}", rootFile.getAbsolutePath());

            File localFile = new File("submission.json");
            prettyMapper.writeValue(localFile, payload);
            log.info("Successfully wrote local copy to: {}", localFile.getAbsolutePath());

        } catch (Exception e) {
            log.error("Failed to write submission.json: {}", e.getMessage(), e);
        }
    }
}
