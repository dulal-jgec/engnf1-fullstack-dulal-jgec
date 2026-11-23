package com.triagesync.backend.dto.resource;

import com.triagesync.backend.enums.ResourceType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ResourceResponse {
    private UUID id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String description;
    private boolean isActive;
    private LocalDateTime createdAt;
}