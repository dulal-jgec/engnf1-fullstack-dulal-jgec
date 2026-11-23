package com.triagesync.backend.repository.specification;

import com.triagesync.backend.entity.Ticket;
import com.triagesync.backend.enums.Category;
import com.triagesync.backend.enums.Priority;
import com.triagesync.backend.enums.TicketStatus;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {
    
    public static Specification<Ticket> filterTickets(TicketStatus status, Category category, Priority priority, String q) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (category != null) predicates.add(cb.equal(root.get("category"), category));
            if (priority != null) predicates.add(cb.equal(root.get("priority"), priority));
            
            if (q != null && !q.trim().isEmpty()) {
                String searchPattern = "%" + q.trim().toLowerCase() + "%";
                Predicate subjectMatch = cb.like(cb.lower(root.get("subject")), searchPattern);
                Predicate bodyMatch = cb.like(cb.lower(root.get("body")), searchPattern);
                predicates.add(cb.or(subjectMatch, bodyMatch));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}