package com.billing.repository;

import com.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumberAndCompanyId(String invoiceNumber, Long companyId);

    @Query("""
        SELECT i FROM Invoice i
        WHERE i.company.id = :companyId
        AND (CAST(:from AS timestamp) IS NULL OR i.createdAt >= :from)
        AND (CAST(:to AS timestamp) IS NULL OR i.createdAt <= :to)
        AND (CAST(:customerId AS long) IS NULL OR i.customer.id = :customerId)
        AND (CAST(:paymentMethod AS string) IS NULL OR i.paymentMethod = :paymentMethod)
        AND (CAST(:invoiceNumber AS string) IS NULL OR
             LOWER(CAST(i.invoiceNumber AS string)) LIKE LOWER(CAST(CONCAT('%', :invoiceNumber, '%') AS string)) OR
             LOWER(CAST(i.customerName AS string)) LIKE LOWER(CAST(CONCAT('%', :invoiceNumber, '%') AS string)) OR
             CAST(i.customerPhone AS string) LIKE CAST(CONCAT('%', :invoiceNumber, '%') AS string))
        ORDER BY i.createdAt DESC
    """)
    Page<Invoice> searchInvoices(@Param("companyId") Long companyId,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to,
                                  @Param("customerId") Long customerId,
                                  @Param("paymentMethod") Invoice.PaymentMethod paymentMethod,
                                  @Param("invoiceNumber") String invoiceNumber,
                                  Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(i.grandTotal), 0)
        FROM Invoice i
        WHERE i.company.id = :companyId
        AND i.createdAt >= :from AND i.createdAt <= :to
        AND i.paymentStatus = 'PAID'
    """)
    BigDecimal sumRevenueByDateRange(@Param("companyId") Long companyId,
                                     @Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to);

    @Query("""
        SELECT COUNT(i)
        FROM Invoice i
        WHERE i.company.id = :companyId
        AND i.createdAt >= :from AND i.createdAt <= :to
    """)
    long countByDateRange(@Param("companyId") Long companyId,
                          @Param("from") LocalDateTime from,
                          @Param("to") LocalDateTime to);

    @Query("""
        SELECT COALESCE(SUM(i.discountAmount), 0)
        FROM Invoice i
        WHERE i.company.id = :companyId
        AND i.createdAt >= :from AND i.createdAt <= :to
    """)
    BigDecimal sumDiscountsByDateRange(@Param("companyId") Long companyId,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    @Query("""
        SELECT COALESCE(SUM(i.taxAmount), 0)
        FROM Invoice i
        WHERE i.company.id = :companyId
        AND i.createdAt >= :from AND i.createdAt <= :to
    """)
    BigDecimal sumTaxesByDateRange(@Param("companyId") Long companyId,
                                    @Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT DATE(created_at) as sale_date, 
               COUNT(*) as bill_count,
               SUM(grand_total) as revenue
        FROM invoices
        WHERE company_id = :companyId
        AND created_at >= :from
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
    """, nativeQuery = true)
    List<Object[]> getDailySalesTrend(@Param("companyId") Long companyId, @Param("from") LocalDateTime from);

    @Query(value = """
        SELECT EXTRACT(MONTH FROM created_at) as month,
               EXTRACT(YEAR FROM created_at) as year,
               COUNT(*) as bill_count,
               SUM(grand_total) as revenue
        FROM invoices
        WHERE company_id = :companyId
        AND created_at >= :from
        GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
        ORDER BY year ASC, month ASC
    """, nativeQuery = true)
    List<Object[]> getMonthlyRevenueTrend(@Param("companyId") Long companyId, @Param("from") LocalDateTime from);

    long countByCompanyId(Long companyId);
}
