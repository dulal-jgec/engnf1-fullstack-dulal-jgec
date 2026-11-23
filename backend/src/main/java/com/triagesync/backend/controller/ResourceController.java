package com.triagesync.backend.controller;

import com.triagesync.backend.dto.PageResponse;
import com.triagesync.backend.dto.resource.ResourceRequest;
import com.triagesync.backend.dto.resource.ResourceResponse;
import com.triagesync.backend.entity.Resource;
import com.triagesync.backend.enums.ResourceType;
import com.triagesync.backend.mapper.ResourceMapper;
import com.triagesync.backend.repository.ResourceRepository;
import com.triagesync.backend.service.ResourceService;
import com.triagesync.backend.security.AuthUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceRepository resourceRepository;
    private final AuthUtil authUtil;

    @GetMapping
    public ResponseEntity<PageResponse<ResourceResponse>> getResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(defaultValue = "1") int page) {
        
        // Simplified pagination logic (10 per page) using in-memory filtering for hackathon speed.
        // In true production, this goes to repository via Specification.
        var allResources = resourceRepository.findAll().stream()
                .filter(r -> authUtil.isAdmin() || r.isActive()) // Rule: USER sees only active
                .filter(r -> search == null || r.getName().toLowerCase().contains(search.toLowerCase()))
                .filter(r -> type == null || r.getType().name().equals(type.toUpperCase()))
                .filter(r -> minCapacity == null || r.getCapacity() >= minCapacity)
                .sorted((a,b) -> a.getName().compareToIgnoreCase(b.getName()))
                .toList();

        int start = (page - 1) * 10;
        int end = Math.min(start + 10, allResources.size());
        List<ResourceResponse> paginatedData = start < allResources.size() 
            ? allResources.subList(start, end).stream().map(ResourceMapper::toResponse).toList()
            : List.of();

        return ResponseEntity.ok(PageResponse.<ResourceResponse>builder()
                .data(paginatedData)
                .page(page)
                .pageSize(10)
                .total(allResources.size())
                .totalPages((int) Math.ceil((double) allResources.size() / 10))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResource(@PathVariable UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        
        if (!authUtil.isAdmin() && !resource.isActive()) {
            throw new IllegalArgumentException("Resource is inactive"); // Returns 404
        }
        return ResponseEntity.ok(ResourceMapper.toResponse(resource));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return new ResponseEntity<>(ResourceMapper.toResponse(resourceService.createResource(request)), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(@PathVariable UUID id, @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(ResourceMapper.toResponse(resourceService.updateResource(id, request)));
    }
}