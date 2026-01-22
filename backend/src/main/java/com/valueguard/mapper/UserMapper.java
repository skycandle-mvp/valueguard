package com.valueguard.mapper;

import com.valueguard.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    User findById(@Param("uid") String uid);
    User findByEmail(@Param("email") String email);
    User findByPhoneNumber(@Param("phoneNumber") String phoneNumber);
    boolean existsByEmail(@Param("email") String email);
    boolean existsByPhoneNumber(@Param("phoneNumber") String phoneNumber);
    int insert(User user);
    int update(User user);
    int deleteById(@Param("uid") String uid);
    List<User> findAll();
}

