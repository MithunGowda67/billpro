package com.billing.repository;

import com.billing.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhoneAndCompanyId(String phone, Long companyId);

    @Query("""
        SELECT c FROM Customer c
        WHERE c.company.id = :companyId
        AND (CAST(:search AS string) IS NULL OR LOWER(CAST(c.name AS string)) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))
             OR CAST(c.phone AS string) LIKE CAST(CONCAT('%', :search, '%') AS string))
        ORDER BY c.name ASC
    """)
    Page<Customer> searchCustomers(@Param("companyId") Long companyId,
                                    @Param("search") String search,
                                    Pageable pageable);

    long countByCompanyId(Long companyId);
}
