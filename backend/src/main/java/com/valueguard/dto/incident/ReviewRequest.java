package com.valueguard.dto.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank(message = "审核内容不能为空")
    @Size(min = 20, message = "审核内容至少需要20个字符")
    private String review;
}

