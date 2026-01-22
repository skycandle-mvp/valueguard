package com.valueguard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private String id;
    private String incidentId;
    private String review;
    private ReviewStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum ReviewStatus {
        PENDING, APPROVED, REJECTED
    }
}
