package com.triagesync.backend.dto.ticket;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketEventResponse {
    private String field;
    private String oldValue;
    private String newValue;
    private String actor;
    private LocalDateTime createdAt;
}