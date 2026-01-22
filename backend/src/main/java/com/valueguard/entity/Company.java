package com.valueguard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    private String id;
    private String name;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
