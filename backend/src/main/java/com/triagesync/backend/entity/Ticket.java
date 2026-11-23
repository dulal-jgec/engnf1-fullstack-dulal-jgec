package com.triagesync.backend.entity;

import com.triagesync.backend.enums.Category;
import com.triagesync.backend.enums.Priority;
import com.triagesync.backend.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets", indexes = {
    @Index(name = "idx_ticket_extid", columnList = "externalId", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String externalId;

    @Column(nullable = false, length = 150)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category autoCategory; // Rule T-B1

    @Enumerated(EnumType.STRING)
    private Category category;

    @Column(nullable = false)
    private boolean isHumanOverride = false; // Rule T-B2

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    private UUID assigneeId;
    
    @Column(nullable = false)
    private boolean isReviewed = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); this.updatedAt = LocalDateTime.now(); }
    
    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}