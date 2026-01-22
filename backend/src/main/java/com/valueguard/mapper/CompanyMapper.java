package com.valueguard.mapper;

import com.valueguard.entity.Company;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompanyMapper {
    Company findById(@Param("id") String id);
    Company findByNameIgnoreCase(@Param("name") String name);
    int insert(Company company);
    int update(Company company);
    int deleteById(@Param("id") String id);
    List<Company> findAll();
}

