package com.triagesync.backend.repository;

import com.triagesync.backend.entity.Booking;
import com.triagesync.backend.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    
    // RULE B6: Pessimistic Lock for Concurrency Safety
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookingsForUpdate(
        @Param("resourceId") UUID resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    // RULE B7: Max 3 active future bookings limit
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.userId = :userId " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime > :now")
    long countActiveFutureBookings(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    // Pagination for "My Bookings"
    Page<Booking> findByUserId(UUID userId, Pageable pageable);
    
    // Pagination for "My Bookings" with status filter
    Page<Booking> findByUserIdAndStatus(UUID userId, BookingStatus status, Pageable pageable);
    
    // Pagination for Admin (All bookings)
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
}