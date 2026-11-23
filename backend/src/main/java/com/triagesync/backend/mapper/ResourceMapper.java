package com.triagesync.backend.mapper;

import com.triagesync.backend.dto.resource.ResourceResponse;
import com.triagesync.backend.entity.Resource;

public class ResourceMapper {

    public static ResourceResponse toResponse(Resource resource) {
        if (resource == null) return null;
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .description(resource.getDescription())
                .isActive(resource.isActive())
                .createdAt(resource.getCreatedAt())
                .build();
    }
}