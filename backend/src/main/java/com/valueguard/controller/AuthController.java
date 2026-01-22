package com.valueguard.controller;

import com.valueguard.dto.ApiResponse;
import com.valueguard.dto.auth.*;
import com.valueguard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/signup/email")
    public ResponseEntity<ApiResponse<UserResponse>> signupWithEmail(
            @Valid @RequestBody EmailSignupRequest request) {
        try {
            UserResponse user = authService.signupWithEmail(request);
            return ResponseEntity.ok(ApiResponse.success("注册成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("注册失败：" + e.getMessage()));
        }
    }
    
    @PostMapping("/signup/phone")
    public ResponseEntity<ApiResponse<UserResponse>> signupWithPhone(
            @Valid @RequestBody PhoneSignupRequest request) {
        try {
            UserResponse user = authService.signupWithPhone(request);
            return ResponseEntity.ok(ApiResponse.success("注册成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("注册失败：" + e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("登录成功", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("登录失败：" + e.getMessage()));
        }
    }
    
    @PostMapping("/resolve-email")
    public ResponseEntity<ApiResponse<ResolveEmailResponse>> resolveEmail(
            @Valid @RequestBody ResolveEmailRequest request) {
        try {
            String email = authService.resolveEmail(request.getAccount());
            return ResponseEntity.ok(ApiResponse.success(new ResolveEmailResponse(email, null)));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(new ResolveEmailResponse(null, e.getMessage())));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        try {
            String uid = authentication.getName();
            UserResponse user = authService.getCurrentUser(uid);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户信息失败：" + e.getMessage()));
        }
    }
}

