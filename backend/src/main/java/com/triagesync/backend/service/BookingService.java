package com.triagesync.backend.service;

import com.triagesync.backend.dto.booking.BookingRequest;
import com.triagesync.backend.entity.Booking;
import com.triagesync.backend.entity.Resource;
import com.triagesync.backend.enums.BookingStatus;
import com.triagesync.backend.repository.BookingRepository;
import com.triagesync.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    // RULE B6: Atomic overlap check with Pessimistic Lock
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Booking createBooking(UUID userId, BookingRequest request) {
        
        // 1. Validate Resource
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
                
        if (!resource.isActive()) {
            throw new IllegalStateException("Cannot book an inactive resource");
        }

        // 2. Rule B1-B4: Time Constraints Validation
        validateTimeGrid(request.getStartTime(), request.getEndTime());

        // 3. Rule B7: Max 3 future active bookings
        long activeCount = bookingRepository.countActiveFutureBookings(userId, LocalDateTime.now());
        if (activeCount >= 3) {
            throw new IllegalStateException("Maximum limit of 3 active future bookings reached");
        }

        // 4. Rule B5 & B6: Overlap Check with Lock
        List<Booking> conflicts = bookingRepository.findConflictingBookingsForUpdate(
                request.getResourceId(), request.getStartTime(), request.getEndTime());
                
        if (!conflicts.isEmpty()) {
            // Eita throw korle amader GlobalExceptionHandler 409 Conflict return korbe
            throw new IllegalStateException("Time slot is already booked (Overlap detected)");
        }

        // 5. Create Booking (Initial status: PENDING)
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .userId(userId)
                .ticketId(request.getTicketId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(UUID bookingId, BookingStatus newStatus, String decisionNote, UUID requestingUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Security Check: USER can only cancel their own booking
        if (!isAdmin && !booking.getUserId().equals(requestingUserId)) {
            throw new SecurityException("You are not authorized to modify this booking");
        }

        // Rule B10-B12: Status Transition logic
        if (newStatus == BookingStatus.APPROVED || newStatus == BookingStatus.REJECTED) {
            if (!isAdmin) throw new SecurityException("Only admins can approve/reject");
            if (booking.getStatus() != BookingStatus.PENDING) {
                throw new IllegalStateException("Only PENDING bookings can be approved/rejected");
            }
            if (newStatus == BookingStatus.REJECTED && (decisionNote == null || decisionNote.trim().isEmpty())) {
                throw new IllegalArgumentException("Rejection note is required");
            }
            booking.setDecisionNote(decisionNote);
        } 
        else if (newStatus == BookingStatus.CANCELLED) {
            if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
                throw new IllegalStateException("Cannot cancel a " + booking.getStatus() + " booking");
            }
            if (booking.getStartTime().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Cannot cancel a booking that has already started");
            }
        } else {
            throw new IllegalArgumentException("Invalid status transition");
        }

        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    private void validateTimeGrid(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.getMinute() != 0 && startTime.getMinute() != 30) {
            throw new IllegalArgumentException("Start time must be on 00 or 30 minutes");
        }
        if (endTime.getMinute() != 0 && endTime.getMinute() != 30) {
            throw new IllegalArgumentException("End time must be on 00 or 30 minutes");
        }
        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        if (durationMinutes < 30 || durationMinutes > 240) {
            throw new IllegalArgumentException("Duration must be between 30 and 240 minutes");
        }
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time must be in the future");
        }
        if (startTime.isAfter(LocalDateTime.now().plusDays(30))) {
            throw new IllegalArgumentException("Cannot book more than 30 days ahead");
        }
    }
}