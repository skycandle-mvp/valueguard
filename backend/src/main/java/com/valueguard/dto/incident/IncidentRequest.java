package com.valueguard.dto.incident;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class IncidentRequest {
    @NotBlank(message = "公司名称不能为空")
    @Size(min = 2, message = "公司名称至少需要2个字符")
    private String companyName;
    
    @NotBlank(message = "标题不能为空")
    @Size(min = 10, message = "标题至少需要10个字符")
    private String title;
    
    @NotBlank(message = "描述不能为空")
    @Size(min = 50, message = "描述至少需要50个字符")
    private String description;
    
    @Size(min = 1, message = "至少需要选择一个分类")
    private List<String> categories;
}

