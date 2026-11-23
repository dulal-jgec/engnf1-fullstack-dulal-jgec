package com.triagesync.backend.config;

import com.triagesync.backend.entity.*;
import com.triagesync.backend.enums.*;
import com.triagesync.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedResources();
        seedTickets();
    }

    private void seedUsers() {
        // Idempotent: check if users already exist
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin Lead")
                    .email("admin@triagesync.test")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .build();

            User user = User.builder()
                    .name("Agent Demo")
                    .email("user@triagesync.test")
                    .passwordHash(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.saveAll(List.of(admin, user));
            System.out.println("✅ Users seeded successfully.");
        }
    }

    private void seedResources() {
        // Idempotent: check if resources already exist
        if (resourceRepository.count() == 0) {
            Resource labA = Resource.builder()
                    .name("Lab A")
                    .type(ResourceType.LAB)
                    .capacity(20)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            Resource labB = Resource.builder()
                    .name("Lab B")
                    .type(ResourceType.LAB)
                    .capacity(15)
                    .isActive(false) // Inactive as per rule
                    .createdAt(LocalDateTime.now())
                    .build();

            Resource serverRoom = Resource.builder()
                    .name("Server Room 1")
                    .type(ResourceType.ROOM)
                    .capacity(5)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            Resource meetingRoom = Resource.builder()
                    .name("Meeting Room X")
                    .type(ResourceType.ROOM)
                    .capacity(10)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            Resource diagTool = Resource.builder()
                    .name("Diagnostic Tool 1")
                    .type(ResourceType.EQUIPMENT)
                    .capacity(1)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            Resource oscilloscope = Resource.builder()
                    .name("Oscilloscope")
                    .type(ResourceType.EQUIPMENT)
                    .capacity(1)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            resourceRepository.saveAll(List.of(labA, labB, serverRoom, meetingRoom, diagTool, oscilloscope));
            System.out.println("✅ Resources seeded successfully.");
        }
    }

    private void seedTickets() {
        if (ticketRepository.count() == 0) {
            // Create 15 tickets as per Rule 6.1
            // 1. Billing (Refund)
            Ticket t1 = Ticket.builder()
                    .externalId("T-001")
                    .subject("Refund request for order #1234")
                    .body("I was charged twice. Please refund my money.")
                    .autoCategory(Category.BILLING)
                    .category(Category.BILLING)
                    .priority(Priority.HIGH)
                    .status(TicketStatus.OPEN)
                    .isHumanOverride(false)
                    .isReviewed(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // 2. Login issue
            Ticket t2 = Ticket.builder()
                    .externalId("T-002")
                    .subject("Cannot login to my account")
                    .body("I lost my password and the reset link is not working.")
                    .autoCategory(Category.LOGIN)
                    .category(Category.LOGIN)
                    .priority(Priority.HIGH)
                    .status(TicketStatus.OPEN)
                    .isHumanOverride(false)
                    .isReviewed(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // 3. XSS Test Case (Rule 6.1)
            Ticket t3 = Ticket.builder()
                    .externalId("T-003")
                    .subject("Package not arrived")
                    .body("<script>alert('xss')</script> My package has not arrived yet.")
                    .autoCategory(Category.DELIVERY)
                    .category(Category.DELIVERY)
                    .priority(Priority.MEDIUM)
                    .status(TicketStatus.OPEN)
                    .isHumanOverride(false)
                    .isReviewed(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // 4. Reviewed Ticket (Rule 6.1)
            Ticket t4 = Ticket.builder()
                    .externalId("T-004")
                    .subject("App crashes on dashboard")
                    .body("Getting error 500 when I open the dashboard.")
                    .autoCategory(Category.BUG)
                    .category(Category.FEATURE_REQUEST) // Human override example
                    .priority(Priority.URGENT)
                    .status(TicketStatus.IN_PROGRESS)
                    .isHumanOverride(true)
                    .isReviewed(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            // ... Add 11 more tickets similarly to reach 15 ...
            // For brevity, I am adding a loop to generate dummy tickets
            for (int i = 5; i <= 15; i++) {
                Ticket dummy = Ticket.builder()
                        .externalId("T-0" + String.format("%02d", i))
                        .subject("Dummy Ticket " + i)
                        .body("This is a dummy ticket for testing.")
                        .autoCategory(Category.FEATURE_REQUEST)
                        .category(Category.FEATURE_REQUEST)
                        .priority(Priority.LOW)
                        .status(TicketStatus.OPEN)
                        .isHumanOverride(false)
                        .isReviewed(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                ticketRepository.save(dummy);
            }

            ticketRepository.saveAll(List.of(t1, t2, t3, t4));
            System.out.println("✅ Tickets seeded successfully.");
        }
    }
}