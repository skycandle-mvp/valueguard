package com.valueguard.controller;

import com.valueguard.dto.ApiResponse;
import com.valueguard.dto.PageResponse;
import com.valueguard.dto.incident.IncidentRequest;
import com.valueguard.dto.incident.IncidentResponse;
import com.valueguard.dto.incident.ReviewRequest;
import com.valueguard.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/incidents")
public class IncidentController {
    
    @Autowired
    private IncidentService incidentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(
            @Valid @RequestBody IncidentRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            IncidentResponse incident = incidentService.createIncident(request, userId);
            return ResponseEntity.ok(ApiResponse.success("事件提交成功", incident));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("事件提交失败：" + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<IncidentResponse>>> getIncidents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "date,desc") String sort) {
        try {
            PageResponse<IncidentResponse> response = incidentService.getIncidents(page, size, search, sort);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取事件列表失败：" + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentById(@PathVariable String id) {
        try {
            IncidentResponse incident = incidentService.getIncidentById(id);
            return ResponseEntity.ok(ApiResponse.success(incident));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取事件详情失败：" + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<Void>> submitReviewRequest(
            @PathVariable String id,
            @Valid @RequestBody ReviewRequest request) {
        try {
            incidentService.submitReviewRequest(id, request);
            return ResponseEntity.ok(ApiResponse.success("已提交审核", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("提交审核失败：" + e.getMessage()));
        }
    }
}

