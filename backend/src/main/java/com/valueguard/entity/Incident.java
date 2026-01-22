package com.valueguard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    private String id;
    private String companyName;
    private String companyId;
    private String title;
    private String description;
    private List<String> categories;
    private String userId;
    private User user;
    private LocalDateTime date;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
