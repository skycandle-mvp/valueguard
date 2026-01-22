package com.valueguard.mapper;

import com.valueguard.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CommentMapper {
    Comment findById(@Param("id") String id);
    List<Comment> findByIncidentId(@Param("incidentId") String incidentId);
    List<Comment> findByIncidentIdOrderByCreatedAtDesc(@Param("incidentId") String incidentId);
    int insert(Comment comment);
    int update(Comment comment);
    int deleteById(@Param("id") String id);
    List<Comment> findAll();
}

