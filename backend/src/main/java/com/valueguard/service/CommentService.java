package com.valueguard.service;

import com.valueguard.dto.PageResponse;
import com.valueguard.dto.comment.CommentRequest;
import com.valueguard.dto.comment.CommentResponse;
import com.valueguard.entity.Comment;
import com.valueguard.entity.User;
import com.valueguard.mapper.CommentMapper;
import com.valueguard.mapper.IncidentMapper;
import com.valueguard.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentService {
    
    @Autowired
    private CommentMapper commentMapper;
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private IncidentMapper incidentMapper;
    
    @Transactional
    public CommentResponse createComment(String incidentId, CommentRequest request, String userId) {
        if (!incidentMapper.existsById(incidentId)) {
            throw new RuntimeException("事件不存在");
        }
        
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setIncidentId(incidentId);
        comment.setText(request.getComment());
        comment.setUserId(userId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        commentMapper.insert(comment);
        
        // 重新查询以获取完整数据
        Comment saved = commentMapper.findById(comment.getId());
        if (saved == null) {
            throw new RuntimeException("创建评论失败");
        }
        
        return toCommentResponse(saved, user);
    }
    
    public PageResponse<CommentResponse> getComments(String incidentId, int page, int size, String sort) {
        int pageNumber = Math.max(0, page - 1);
        int pageSize = Math.max(1, Math.min(100, size));
        
        List<Comment> allComments = commentMapper.findByIncidentIdOrderByCreatedAtDesc(incidentId);
        
        // 手动分页
        int total = allComments.size();
        int totalPages = (total + pageSize - 1) / pageSize;
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, total);
        
        List<Comment> pagedComments = start < total ? allComments.subList(start, end) : List.of();
        
        return new PageResponse<>(
                pagedComments.stream()
                        .map(this::toCommentResponse)
                        .collect(Collectors.toList()),
                (long) total,
                totalPages,
                pageNumber + 1,
                pageSize
        );
    }
    
    private CommentResponse toCommentResponse(Comment comment) {
        User user = comment.getUser();
        com.valueguard.dto.auth.UserResponse userResponse = null;
        if (user != null) {
            userResponse = new com.valueguard.dto.auth.UserResponse(
                    user.getUid(),
                    user.getEmail(),
                    user.getDisplayName(),
                    user.getPhotoURL()
            );
        }
        
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getUserId(),
                comment.getIncidentId(),
                userResponse,
                comment.getCreatedAt()
        );
    }
    
    private CommentResponse toCommentResponse(Comment comment, User user) {
        com.valueguard.dto.auth.UserResponse userResponse = new com.valueguard.dto.auth.UserResponse(
                user.getUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoURL()
        );
        
        return new CommentResponse(
                comment.getId(),
                comment.getText(),
                comment.getUserId(),
                comment.getIncidentId(),
                userResponse,
                comment.getCreatedAt()
        );
    }
}
