package com.triagesync.backend.dto.resource;

import com.triagesync.backend.enums.ResourceType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 60, message = "Name must be between 3 and 60 characters")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 500, message = "Capacity cannot exceed 500")
    private Integer capacity;

    @Size(max = 300, message = "Description cannot exceed 300 characters")
    private String description;

    private Boolean isActive; // Nullable for create (default true), used for PATCH
}