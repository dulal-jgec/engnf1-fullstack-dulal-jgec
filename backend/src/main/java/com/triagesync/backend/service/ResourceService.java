package com.triagesync.backend.service;

import com.triagesync.backend.dto.resource.ResourceRequest;
import com.triagesync.backend.entity.Resource;
import com.triagesync.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional
    public Resource createResource(ResourceRequest request) {
        // Rule B11: Duplicate name check (ignoring case)
        if (resourceRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new IllegalStateException("Resource with this name already exists");
        }

        Resource resource = Resource.builder()
                .name(request.getName().trim())
                .type(request.getType())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdAt(LocalDateTime.now())
                .build();

        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateResource(UUID id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        // Check for duplicate name if name is being changed
        if (request.getName() != null && !resource.getName().equalsIgnoreCase(request.getName())) {
            if (resourceRepository.existsByNameIgnoreCase(request.getName().trim())) {
                throw new IllegalStateException("Resource with this name already exists");
            }
            resource.setName(request.getName().trim());
        }

        if (request.getType() != null) resource.setType(request.getType());
        if (request.getCapacity() != null) resource.setCapacity(request.getCapacity());
        if (request.getDescription() != null) resource.setDescription(request.getDescription());
        
        // Fixed Lombok setter for boolean
        if (request.getIsActive() != null) resource.setActive(request.getIsActive());

        return resourceRepository.save(resource);
    }
}