package com.triagesync.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ticketId;

    @Column(nullable = false)
    private String field; // category, priority, status

    private String oldValue;
    private String newValue;
    private String actor; // X-Agent header

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}