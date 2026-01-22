package com.valueguard.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PhoneSignupRequest {
    @NotBlank(message = "手机号不能为空")
    private String phoneNumber;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码至少需要6个字符")
    private String password;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Size(min = 2, message = "昵称至少需要2个字符")
    private String displayName;
    
    @NotBlank(message = "ID Token不能为空")
    private String idToken;
}

