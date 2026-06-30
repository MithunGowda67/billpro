package com.billing.repository;

import com.billing.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    @Query(value = """
        SELECT ii.item_id, ii.item_name, ii.item_code,
               SUM(ii.quantity) as total_qty,
               SUM(ii.line_total) as total_revenue
        FROM invoice_items ii
        JOIN invoices inv ON ii.invoice_id = inv.id
        WHERE inv.company_id = :companyId
        AND inv.created_at >= :from AND inv.created_at <= :to
        GROUP BY ii.item_id, ii.item_name, ii.item_code
        ORDER BY total_revenue DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> findTopSellingProducts(@Param("companyId") Long companyId,
                                           @Param("from") LocalDateTime from,
                                           @Param("to") LocalDateTime to,
                                           @Param("limit") int limit);

    @Query(value = """
        SELECT c.name as category_name,
               SUM(ii.line_total) as total_revenue,
               SUM(ii.quantity) as total_qty
        FROM invoice_items ii
        JOIN invoices inv ON ii.invoice_id = inv.id
        JOIN items it ON ii.item_id = it.id
        JOIN categories c ON it.category_id = c.id
        WHERE inv.company_id = :companyId
        AND inv.created_at >= :from AND inv.created_at <= :to
        GROUP BY c.name
        ORDER BY total_revenue DESC
    """, nativeQuery = true)
    List<Object[]> findCategoryPerformance(@Param("companyId") Long companyId,
                                            @Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);
}
