package com.valueguard.dto.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequest {
    @NotBlank(message = "评论内容不能为空")
    private String comment;
}

