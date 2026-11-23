package com.triagesync.backend.controller;

import com.triagesync.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatsController {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTicketStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Mocking data for hackathon speed. In production, use JPQL GroupBy queries.
        stats.put("byCategory", Map.of("BUG", 5, "BILLING", 3, "LOGIN", 2));
        stats.put("byPriority", Map.of("HIGH", 4, "MEDIUM", 6));
        stats.put("byStatus", Map.of("OPEN", 8, "IN_PROGRESS", 2));
        stats.put("reviewedCount", ticketRepository.findAll().stream().filter(t -> t.isReviewed()).count());
        stats.put("modelAgreementRate", 85.5); // Mocked percentage

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("activeResources", resourceRepository.findAll().stream().filter(r -> r.isActive()).count());
        stats.put("bookingsByStatus", Map.of("PENDING", 2, "APPROVED", 5));
        stats.put("topResources", java.util.List.of("Lab A", "Server Room 1"));
        stats.put("ticketStats", getTicketStats().getBody());

        return ResponseEntity.ok(stats);
    }
}