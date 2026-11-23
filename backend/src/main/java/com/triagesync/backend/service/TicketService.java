package com.triagesync.backend.service;

import com.triagesync.backend.dto.ticket.TicketImportRequest;
import com.triagesync.backend.dto.ticket.TicketUpdateRequest;
import com.triagesync.backend.entity.Ticket;
import com.triagesync.backend.entity.TicketEvent;
import com.triagesync.backend.enums.Category;
import com.triagesync.backend.enums.Priority;
import com.triagesync.backend.enums.TicketStatus;
import com.triagesync.backend.repository.TicketEventRepository;
import com.triagesync.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketEventRepository ticketEventRepository;

    // RULE T-B1 & T-B2: Deterministic Auto-Triage & Idempotent Import
    @Transactional
    public Map<String, Integer> importTickets(TicketImportRequest request) {
        int imported = 0, updated = 0, skippedOverride = 0;

        for (TicketImportRequest.TicketItem item : request.getTickets()) {
            Optional<Ticket> existingOpt = ticketRepository.findByExternalId(item.getExternalId());

            if (existingOpt.isPresent()) {
                Ticket existing = existingOpt.get();
                // Re-import: Update subject/body if changed
                if (!existing.getSubject().equals(item.getSubject()) || !existing.getBody().equals(item.getBody())) {
                    existing.setSubject(item.getSubject());
                    existing.setBody(item.getBody());
                    
                    // RULE T-B2: Only re-classify if Human hasn't overridden
                    if (!existing.isHumanOverride()) {
                        classifyTicket(existing);
                    } else {
                        skippedOverride++;
                    }
                    existing.setUpdatedAt(LocalDateTime.now());
                    ticketRepository.save(existing);
                    updated++;
                }
            } else {
                // New Ticket
                Ticket newTicket = Ticket.builder()
                        .externalId(item.getExternalId())
                        .subject(item.getSubject())
                        .body(item.getBody())
                        .status(TicketStatus.OPEN)
                        .isReviewed(false)
                        .isHumanOverride(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                
                classifyTicket(newTicket);
                ticketRepository.save(newTicket);
                imported++;
            }
        }
        
        Map<String, Integer> response = new HashMap<>();
        response.put("importedCount", imported);
        response.put("updatedCount", updated);
        response.put("skippedOverrideCount", skippedOverride);
        response.put("total", request.getTickets().size());
        return response;
    }

    // RULE T-B1: Deterministic Classifier Logic
    private void classifyTicket(Ticket ticket) {
        String content = (ticket.getSubject() + " " + ticket.getBody()).toLowerCase();

        // Category Logic
        if (content.contains("refund") || content.contains("invoice") || content.contains("charge") || content.contains("payment")) {
            ticket.setCategory(Category.BILLING);
        } else if (content.contains("password") || content.contains("2fa") || content.contains("sign in") || content.contains("locked out") || content.contains("login")) {
            ticket.setCategory(Category.LOGIN);
        } else if (content.contains("package") || content.contains("arrived") || content.contains("shipping") || content.contains("tracking") || content.contains("delivery")) {
            ticket.setCategory(Category.DELIVERY);
        } else if (content.contains("crash") || content.contains("error") || content.contains("500") || content.contains("exception") || content.contains("broken")) {
            ticket.setCategory(Category.BUG);
        } else {
            ticket.setCategory(Category.FEATURE_REQUEST);
        }
        
        // AutoCategory is immutable (Rule 6.2)
        ticket.setAutoCategory(ticket.getCategory());

        // Priority Logic
        if (content.contains("urgent") || content.contains("production down") || content.contains("locked out")) {
            ticket.setPriority(Priority.URGENT);
        } else if (content.contains("error") || content.contains("refund") || content.contains("not arrived")) {
            ticket.setPriority(Priority.HIGH);
        } else {
            ticket.setPriority(Priority.MEDIUM);
        }
    }

    // RULE T-B3: Agent Review & Audit Trail
    @Transactional
    public Ticket updateTicket(UUID ticketId, TicketUpdateRequest request, String agentEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        boolean changed = false;
        boolean categoryChanged = false;

        // Audit for Category
        if (request.getCategory() != null && request.getCategory() != ticket.getCategory()) {
            logEvent(ticketId, "category", ticket.getCategory().name(), request.getCategory().name(), agentEmail);
            ticket.setCategory(request.getCategory());
            ticket.setHumanOverride(true); // Rule T-B2
            categoryChanged = true;
            changed = true;
        }

        // Audit for Priority
        if (request.getPriority() != null && request.getPriority() != ticket.getPriority()) {
            logEvent(ticketId, "priority", ticket.getPriority().name(), request.getPriority().name(), agentEmail);
            ticket.setPriority(request.getPriority());
            changed = true;
        }

        // Audit for Status (Fixed the T-B3 logic here)
        if (request.getStatus() != null && request.getStatus() != ticket.getStatus()) {
            logEvent(ticketId, "status", ticket.getStatus().name(), request.getStatus().name(), agentEmail);
            
            // Save old status before updating
            TicketStatus oldStatus = ticket.getStatus(); 
            ticket.setStatus(request.getStatus());
            
            // Rule T-B3: set isReviewed=true when agent transitions status from OPEN
            if (oldStatus == TicketStatus.OPEN) { 
                 ticket.setReviewed(true); // Fixed Lombok setter
            }
            changed = true;
        }

        // Audit for Assignee
        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(ticket.getAssigneeId())) {
            logEvent(ticketId, "assigneeId", String.valueOf(ticket.getAssigneeId()), String.valueOf(request.getAssigneeId()), agentEmail);
            ticket.setAssigneeId(request.getAssigneeId());
            changed = true;
        }

        if (categoryChanged) {
            ticket.setReviewed(true); // Fixed Lombok setter
        }

        if (changed) {
            ticket.setUpdatedAt(LocalDateTime.now());
            return ticketRepository.save(ticket);
        }
        return ticket;
    }

    private void logEvent(UUID ticketId, String field, String oldValue, String newValue, String actor) {
        TicketEvent event = TicketEvent.builder()
                .ticketId(ticketId)
                .field(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .actor(actor != null ? actor : "system")
                .createdAt(LocalDateTime.now())
                .build();
        ticketEventRepository.save(event);
    }
}