package com.valueguard.dto.company;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {
    private String id;
    private String name;
    private String logoUrl;
    private Long incidentCount;
}

