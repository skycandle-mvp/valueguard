package com.valueguard.service;

import com.valueguard.dto.PageResponse;
import com.valueguard.dto.incident.IncidentRequest;
import com.valueguard.dto.incident.IncidentResponse;
import com.valueguard.entity.Incident;
import com.valueguard.entity.ReviewRequest;
import com.valueguard.entity.User;
import com.valueguard.mapper.CompanyMapper;
import com.valueguard.mapper.IncidentMapper;
import com.valueguard.mapper.ReviewRequestMapper;
import com.valueguard.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    @Autowired
    private IncidentMapper incidentMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private ReviewRequestMapper reviewRequestMapper;

    @Transactional
    public IncidentResponse createIncident(IncidentRequest request, String userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        String incidentId = UUID.randomUUID().toString();
        Incident incident = new Incident();
        incident.setId(incidentId);
        incident.setCompanyName(request.getCompanyName());
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setCategories(request.getCategories());
        incident.setUserId(userId);
        incident.setDate(LocalDateTime.now());
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());

        // 尝试查找或创建公司
        com.valueguard.entity.Company company = companyMapper.findByNameIgnoreCase(request.getCompanyName());
        if (company != null) {
            incident.setCompanyId(company.getId());
        }

        incidentMapper.insert(incident);
        
        // 插入分类
        if (incident.getCategories() != null && !incident.getCategories().isEmpty()) {
            incidentMapper.insertCategories(incidentId, incident.getCategories());
        }

        // 重新查询以获取完整数据
        Incident saved = incidentMapper.findById(incidentId);
        if (saved == null) {
            throw new RuntimeException("创建事件失败");
        }

        return toIncidentResponse(saved, user);
    }

    public PageResponse<IncidentResponse> getIncidents(int page, int size, String search, String sort) {
        int pageNumber = Math.max(0, page - 1);
        int pageSize = Math.max(1, Math.min(100, size));
        
        List<Incident> allIncidents;
        if (search != null && !search.trim().isEmpty()) {
            allIncidents = incidentMapper.searchIncidents(search.trim());
        } else {
            allIncidents = incidentMapper.findAll();
        }
        
        // 手动分页
        int total = allIncidents.size();
        int totalPages = (total + pageSize - 1) / pageSize;
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, total);
        
        List<Incident> pagedIncidents = start < total ? allIncidents.subList(start, end) : List.of();
        
        return new PageResponse<>(
                pagedIncidents.stream()
                        .map(this::toIncidentResponse)
                        .collect(Collectors.toList()),
                (long) total,
                totalPages,
                pageNumber + 1,
                pageSize
        );
    }

    public IncidentResponse getIncidentById(String id) {
        Incident incident = incidentMapper.findById(id);
        if (incident == null) {
            throw new RuntimeException("事件不存在");
        }
        return toIncidentResponse(incident);
    }

    @Transactional
    public void submitReviewRequest(String incidentId, com.valueguard.dto.incident.ReviewRequest request) {
        if (!incidentMapper.existsById(incidentId)) {
            throw new RuntimeException("事件不存在");
        }

        ReviewRequest reviewRequest = new ReviewRequest();
        reviewRequest.setId(UUID.randomUUID().toString());
        reviewRequest.setIncidentId(incidentId);
        reviewRequest.setReview(request.getReview());
        reviewRequest.setStatus(ReviewRequest.ReviewStatus.PENDING);
        reviewRequest.setCreatedAt(LocalDateTime.now());
        reviewRequest.setUpdatedAt(LocalDateTime.now());

        reviewRequestMapper.insert(reviewRequest);
    }

    private IncidentResponse toIncidentResponse(Incident incident) {
        User user = incident.getUser();
        com.valueguard.dto.auth.UserResponse userResponse = null;
        if (user != null) {
            userResponse = new com.valueguard.dto.auth.UserResponse(
                    user.getUid(),
                    user.getEmail(),
                    user.getDisplayName(),
                    user.getPhotoURL()
            );
        }

        return new IncidentResponse(
                incident.getId(),
                incident.getCompanyName(),
                incident.getCompanyId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getCategories(),
                incident.getUserId(),
                userResponse,
                incident.getDate()
        );
    }

    private IncidentResponse toIncidentResponse(Incident incident, User user) {
        com.valueguard.dto.auth.UserResponse userResponse = new com.valueguard.dto.auth.UserResponse(
                user.getUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoURL()
        );

        return new IncidentResponse(
                incident.getId(),
                incident.getCompanyName(),
                incident.getCompanyId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getCategories(),
                incident.getUserId(),
                userResponse,
                incident.getDate()
        );
    }
}
