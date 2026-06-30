package com.billing.repository;

import com.billing.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByCompanyIdOrderByNameAsc(Long companyId);
    boolean existsByNameAndCompanyId(String name, Long companyId);
}
