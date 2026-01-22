package com.valueguard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String id;
    private String text;
    private String userId;
    private String incidentId;
    private User user;
    private Incident incident;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
