package com.billing.repository;

import com.billing.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByCompanyIdAndIsActiveTrue(Long companyId, Pageable pageable);

    @Query("""
        SELECT i FROM Item i
        WHERE i.company.id = :companyId
        AND i.isActive = true
        AND (CAST(:search AS string) IS NULL
             OR LOWER(CAST(i.name AS string)) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))
             OR LOWER(CAST(i.itemCode AS string)) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)))
    """)
    Page<Item> searchItems(@Param("companyId") Long companyId,
                           @Param("search") String search,
                           Pageable pageable);

    @Query("""
        SELECT i FROM Item i
        WHERE i.company.id = :companyId
        AND i.isActive = true
        AND i.quantity <= i.minStockThreshold
        ORDER BY i.quantity ASC
    """)
    List<Item> findLowStockItems(@Param("companyId") Long companyId);

    @Query("""
        SELECT i FROM Item i
        WHERE i.company.id = :companyId
        AND i.isActive = true
        AND (LOWER(CAST(i.name AS string)) LIKE LOWER(CAST(CONCAT('%', :q, '%') AS string))
             OR LOWER(CAST(i.itemCode AS string)) LIKE LOWER(CAST(CONCAT('%', :q, '%') AS string)))
        ORDER BY i.name ASC
    """)
    List<Item> searchForBilling(@Param("companyId") Long companyId, @Param("q") String q);

    Optional<Item> findByItemCodeAndCompanyId(String itemCode, Long companyId);

    long countByCompanyIdAndIsActiveTrue(Long companyId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.company.id = :companyId AND i.isActive = true AND i.quantity <= i.minStockThreshold")
    long countLowStockByCompanyId(@Param("companyId") Long companyId);
}
