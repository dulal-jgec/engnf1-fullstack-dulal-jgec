package com.triagesync.backend.dto.booking;

import com.triagesync.backend.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private UUID resourceId;
    private UUID userId;
    private UUID ticketId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private BookingStatus status;
    private String decisionNote;
    private LocalDateTime createdAt;
}