package com.valueguard.mapper;

import com.valueguard.entity.ReviewRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReviewRequestMapper {
    ReviewRequest findById(@Param("id") String id);
    List<ReviewRequest> findByIncidentId(@Param("incidentId") String incidentId);
    int insert(ReviewRequest reviewRequest);
    int update(ReviewRequest reviewRequest);
    int deleteById(@Param("id") String id);
    List<ReviewRequest> findAll();
}

