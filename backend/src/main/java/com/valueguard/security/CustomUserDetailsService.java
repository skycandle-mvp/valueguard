package com.valueguard.security;

import com.valueguard.entity.User;
import com.valueguard.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails loadUserByUsername(String uid) throws UsernameNotFoundException {
        User user = userMapper.findById(uid);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + uid);
        }
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUid())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build();
    }
}

