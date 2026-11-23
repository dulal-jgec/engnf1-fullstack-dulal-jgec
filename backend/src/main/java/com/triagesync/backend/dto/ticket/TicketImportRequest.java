package com.triagesync.backend.dto.ticket;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class TicketImportRequest {
    @NotEmpty(message = "Tickets list cannot be empty")
    @Valid
    private List<TicketItem> tickets;

    @Data
    public static class TicketItem {
        @NotBlank(message = "External ID is required")
        private String externalId;

        @NotBlank(message = "Subject is required")
        @Size(min = 3, max = 150, message = "Subject must be between 3 and 150 characters")
        private String subject;

        @NotBlank(message = "Body is required")
        @Size(min = 5, max = 2000, message = "Body must be between 5 and 2000 characters")
        private String body;
    }
}