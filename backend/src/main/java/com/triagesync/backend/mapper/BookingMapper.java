package com.triagesync.backend.mapper;

import com.triagesync.backend.dto.booking.BookingResponse;
import com.triagesync.backend.entity.Booking;

public class BookingMapper {

    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .userId(booking.getUserId())
                .ticketId(booking.getTicketId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .status(booking.getStatus())
                .decisionNote(booking.getDecisionNote())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}