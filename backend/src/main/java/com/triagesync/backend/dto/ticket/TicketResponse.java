package com.triagesync.backend.dto.ticket;

import com.triagesync.backend.enums.Category;
import com.triagesync.backend.enums.Priority;
import com.triagesync.backend.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TicketResponse {
    private UUID id;
    private String externalId;
    private String subject;
    private String body;
    private Category autoCategory;
    private Category category;
    private boolean isHumanOverride;
    private Priority priority;
    private TicketStatus status;
    private UUID assigneeId;
    private boolean isReviewed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}