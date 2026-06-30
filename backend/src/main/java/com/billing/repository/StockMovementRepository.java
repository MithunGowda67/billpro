package com.billing.repository;

import com.billing.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.item.company.id = :companyId
        AND (CAST(:itemId AS long) IS NULL OR sm.item.id = :itemId)
        AND (CAST(:from AS timestamp) IS NULL OR sm.createdAt >= :from)
        AND (CAST(:to AS timestamp) IS NULL OR sm.createdAt <= :to)
        ORDER BY sm.createdAt DESC
    """)
    Page<StockMovement> searchMovements(@Param("companyId") Long companyId,
                                         @Param("itemId") Long itemId,
                                         @Param("from") LocalDateTime from,
                                         @Param("to") LocalDateTime to,
                                         Pageable pageable);

    List<StockMovement> findByItemIdOrderByCreatedAtDesc(Long itemId);
}
