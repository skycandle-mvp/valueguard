package com.valueguard.dto.comment;

import com.valueguard.dto.auth.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String text;
    private String userId;
    private String incidentId;
    private UserResponse user;
    private LocalDateTime createdAt;
}

