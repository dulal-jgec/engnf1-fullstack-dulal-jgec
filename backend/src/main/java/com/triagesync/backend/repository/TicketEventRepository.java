package com.triagesync.backend.repository;

import com.triagesync.backend.entity.TicketEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketEventRepository extends JpaRepository<TicketEvent, UUID> {
    
    // Ticket er history dekhanor jonno, latest event age thakbe (Descending order)
    List<TicketEvent> findByTicketIdOrderByCreatedAtDesc(UUID ticketId);
}