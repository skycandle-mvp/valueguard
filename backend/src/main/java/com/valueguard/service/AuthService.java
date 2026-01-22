package com.valueguard.service;

import com.valueguard.dto.auth.*;
import com.valueguard.entity.User;
import com.valueguard.mapper.UserMapper;
import com.valueguard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Transactional
    public UserResponse signupWithEmail(EmailSignupRequest request) {
        if (userMapper.existsByEmail(request.getEmail())) {
            throw new RuntimeException("该邮箱已被注册");
        }
        
        String uid = UUID.randomUUID().toString();
        User user = new User();
        user.setUid(uid);
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setDisplayName(request.getDisplayName() != null ? request.getDisplayName() : 
                          request.getEmail().split("@")[0]);
        user.setPhotoURL("https://i.pravatar.cc/150?u=" + uid);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        userMapper.insert(user);
        
        return toUserResponse(user);
    }
    
    @Transactional
    public UserResponse signupWithPhone(PhoneSignupRequest request) {
        String normalizedPhone = normalizePhoneNumber(request.getPhoneNumber());
        
        if (userMapper.existsByPhoneNumber(normalizedPhone)) {
            throw new RuntimeException("该手机号已被注册");
        }
        
        // 验证 idToken (这里简化处理，实际应该验证 Firebase token)
        // 在实际项目中，应该调用 Firebase Admin SDK 验证 token
        
        String uid = UUID.randomUUID().toString();
        String email = request.getEmail() != null ? request.getEmail() : 
                      buildLoginEmail(normalizedPhone);
        String displayName = request.getDisplayName() != null ? request.getDisplayName() : 
                            "用户" + normalizedPhone.substring(Math.max(0, normalizedPhone.length() - 4));
        
        User user = new User();
        user.setUid(uid);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizedPhone);
        user.setDisplayName(displayName);
        user.setPhotoURL("https://i.pravatar.cc/150?u=" + uid);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        userMapper.insert(user);
        
        return toUserResponse(user);
    }
    
    public LoginResponse login(LoginRequest request) {
        String account = request.getAccount().trim();
        User user;
        
        if (account.contains("@")) {
            user = userMapper.findByEmail(account);
        } else {
            String normalizedPhone = normalizePhoneNumber(account);
            user = userMapper.findByPhoneNumber(normalizedPhone);
        }
        
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUid(),
                        request.getPassword()
                )
        );
        
        String uid = authentication.getName();
        User authenticatedUser = userMapper.findById(uid);
        
        if (authenticatedUser == null) {
            throw new RuntimeException("用户不存在");
        }
        
        String token = jwtUtil.generateToken(uid);
        UserResponse userResponse = toUserResponse(authenticatedUser);
        
        return new LoginResponse(token, userResponse);
    }
    
    public String resolveEmail(String account) {
        String input = account.trim();
        if (input.isEmpty()) {
            throw new RuntimeException("请输入邮箱或手机号");
        }
        
        if (input.contains("@")) {
            return input;
        }
        
        String normalized = normalizePhoneNumber(input);
        User user = userMapper.findByPhoneNumber(normalized);
        
        if (user == null) {
            throw new RuntimeException("未找到该手机号对应的账号");
        }
        
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new RuntimeException("该账号缺少登录邮箱，请联系管理员");
        }
        
        return user.getEmail();
    }
    
    public UserResponse getCurrentUser(String uid) {
        User user = userMapper.findById(uid);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return toUserResponse(user);
    }
    
    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getUid(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoURL()
        );
    }
    
    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber.replaceAll("[\\s-]", "");
    }
    
    private String buildLoginEmail(String phoneNumber) {
        String digits = phoneNumber.replaceAll("\\D", "");
        return "phone-" + digits + "@valueguard.local";
    }
}
