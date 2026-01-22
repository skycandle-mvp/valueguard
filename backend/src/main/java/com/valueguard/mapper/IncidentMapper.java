package com.valueguard.mapper;

import com.valueguard.entity.Incident;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IncidentMapper {
    Incident findById(@Param("id") String id);
    List<Incident> findByCompanyName(@Param("companyName") String companyName);
    List<Incident> searchIncidents(@Param("search") String search);
    List<Incident> findAll();
    long countByCompanyName(@Param("companyName") String companyName);
    int insert(Incident incident);
    int insertCategories(@Param("id") String id, @Param("categories") List<String> categories);
    int update(Incident incident);
    int deleteById(@Param("id") String id);
    boolean existsById(@Param("id") String id);
}

