package com.valueguard.service;

import com.valueguard.dto.PageResponse;
import com.valueguard.dto.company.CompanyResponse;
import com.valueguard.dto.incident.IncidentResponse;
import com.valueguard.entity.Company;
import com.valueguard.entity.Incident;
import com.valueguard.mapper.CompanyMapper;
import com.valueguard.mapper.IncidentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {
    
    @Autowired
    private CompanyMapper companyMapper;
    
    @Autowired
    private IncidentMapper incidentMapper;
    
    public CompanyResponse getCompanyByName(String name) {
        Company company = companyMapper.findByNameIgnoreCase(name);
        
        if (company == null) {
            // 如果公司不存在，创建一个新公司
            company = new Company();
            company.setId(UUID.randomUUID().toString());
            company.setName(name);
            company.setCreatedAt(LocalDateTime.now());
            company.setUpdatedAt(LocalDateTime.now());
            companyMapper.insert(company);
        }
        
        long incidentCount = incidentMapper.countByCompanyName(name);
        
        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                incidentCount
        );
    }
    
    public PageResponse<IncidentResponse> getCompanyIncidents(String name, int page, int size) {
        int pageNumber = Math.max(0, page - 1);
        int pageSize = Math.max(1, Math.min(100, size));
        
        List<Incident> allIncidents = incidentMapper.findByCompanyName(name);
        
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
    
    private IncidentResponse toIncidentResponse(Incident incident) {
        com.valueguard.dto.auth.UserResponse userResponse = null;
        if (incident.getUser() != null) {
            userResponse = new com.valueguard.dto.auth.UserResponse(
                    incident.getUser().getUid(),
                    incident.getUser().getEmail(),
                    incident.getUser().getDisplayName(),
                    incident.getUser().getPhotoURL()
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
}
