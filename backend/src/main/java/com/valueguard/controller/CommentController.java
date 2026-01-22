package com.valueguard.controller;

import com.valueguard.dto.ApiResponse;
import com.valueguard.dto.PageResponse;
import com.valueguard.dto.comment.CommentRequest;
import com.valueguard.dto.comment.CommentResponse;
import com.valueguard.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/incidents/{incidentId}/comments")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable String incidentId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            CommentResponse comment = commentService.createComment(incidentId, request, userId);
            return ResponseEntity.ok(ApiResponse.success("评论已发布", comment));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("发表评论失败：" + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getComments(
            @PathVariable String incidentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        try {
            PageResponse<CommentResponse> response = commentService.getComments(incidentId, page, size, sort);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取评论列表失败：" + e.getMessage()));
        }
    }
}

