package com.triagesync.backend.repository;

import com.triagesync.backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    
    // Rule B11: Unique name ignoring case
    boolean existsByNameIgnoreCase(String name);

    // Useful for updates to check if another resource has the same name
    Optional<Resource> findByNameIgnoreCase(String name);
}