package com.triagesync.backend.dto.ticket;

import com.triagesync.backend.enums.Category;
import com.triagesync.backend.enums.Priority;
import com.triagesync.backend.enums.TicketStatus;
import lombok.Data;
import java.util.UUID;

@Data
public class TicketUpdateRequest {
    private Category category;
    private Priority priority;
    private TicketStatus status;
    private UUID assigneeId;
}