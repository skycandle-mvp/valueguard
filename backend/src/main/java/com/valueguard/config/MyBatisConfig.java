package com.valueguard.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.valueguard.mapper")
public class MyBatisConfig {
}

