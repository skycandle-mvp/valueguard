package com.valueguard.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String uid;
    private String email;
    private String password;
    private String displayName;
    private String photoURL;
    private String phoneNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
