package com.triagesync.backend.mapper;

import com.triagesync.backend.dto.ticket.TicketEventResponse;
import com.triagesync.backend.dto.ticket.TicketResponse;
import com.triagesync.backend.entity.Ticket;
import com.triagesync.backend.entity.TicketEvent;

public class TicketMapper {

    public static TicketResponse toResponse(Ticket ticket) {
        if (ticket == null) return null;
        return TicketResponse.builder()
                .id(ticket.getId())
                .externalId(ticket.getExternalId())
                .subject(ticket.getSubject())
                .body(ticket.getBody())
                .autoCategory(ticket.getAutoCategory())
                .category(ticket.getCategory())
                .isHumanOverride(ticket.isHumanOverride())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .assigneeId(ticket.getAssigneeId())
                .isReviewed(ticket.isReviewed())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public static TicketEventResponse toEventResponse(TicketEvent event) {
        if (event == null) return null;
        return TicketEventResponse.builder()
                .field(event.getField())
                .oldValue(event.getOldValue())
                .newValue(event.getNewValue())
                .actor(event.getActor())
                .createdAt(event.getCreatedAt())
                .build();
    }
}