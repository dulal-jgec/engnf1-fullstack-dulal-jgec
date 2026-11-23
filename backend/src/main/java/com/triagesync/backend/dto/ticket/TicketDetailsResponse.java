package com.triagesync.backend.dto.ticket;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TicketDetailsResponse {
    private TicketResponse ticket;
    private List<TicketEventResponse> events;
}