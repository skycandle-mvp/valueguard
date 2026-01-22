package com.valueguard.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolveEmailRequest {
    @NotBlank(message = "账号不能为空")
    private String account;
}

