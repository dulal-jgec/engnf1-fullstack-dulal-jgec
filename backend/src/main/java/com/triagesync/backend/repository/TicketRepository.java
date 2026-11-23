package com.triagesync.backend.repository;

import com.triagesync.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID>, JpaSpecificationExecutor<Ticket> {
    
    // Rule T-B2: Idempotent import check (externalId diye ticket khuje ber kora)
    Optional<Ticket> findByExternalId(String externalId);
}