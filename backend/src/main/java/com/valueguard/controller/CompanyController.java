package com.valueguard.controller;

import com.valueguard.dto.ApiResponse;
import com.valueguard.dto.PageResponse;
import com.valueguard.dto.company.CompanyResponse;
import com.valueguard.dto.incident.IncidentResponse;
import com.valueguard.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/companies")
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyByName(
            @PathVariable String name) {
        try {
            CompanyResponse company = companyService.getCompanyByName(name);
            return ResponseEntity.ok(ApiResponse.success(company));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取公司信息失败：" + e.getMessage()));
        }
    }
    
    @GetMapping("/{name}/incidents")
    public ResponseEntity<ApiResponse<PageResponse<IncidentResponse>>> getCompanyIncidents(
            @PathVariable String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            PageResponse<IncidentResponse> response = companyService.getCompanyIncidents(name, page, size);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取公司事件列表失败：" + e.getMessage()));
        }
    }
}

