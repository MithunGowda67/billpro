package com.billing.service;

import com.billing.dto.DashboardDTO;
import com.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public DashboardDTO.Summary getSummary(Long companyId) {
        LocalDateTime now = LocalDateTime.now();

        // Today
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = now.toLocalDate().atTime(23, 59, 59);

        // This month
        LocalDateTime monthStart = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        // This quarter
        int currentQuarter = (now.getMonthValue() - 1) / 3;
        int quarterStartMonth = currentQuarter * 3 + 1;
        LocalDateTime quarterStart = LocalDateTime.of(now.getYear(), quarterStartMonth, 1, 0, 0);

        // This year
        LocalDateTime yearStart = LocalDateTime.of(now.getYear(), 1, 1, 0, 0);

        return DashboardDTO.Summary.builder()
                .todayBills(invoiceRepository.countByDateRange(companyId, todayStart, todayEnd))
                .todayRevenue(invoiceRepository.sumRevenueByDateRange(companyId, todayStart, todayEnd))
                .monthBills(invoiceRepository.countByDateRange(companyId, monthStart, todayEnd))
                .monthRevenue(invoiceRepository.sumRevenueByDateRange(companyId, monthStart, todayEnd))
                .quarterRevenue(invoiceRepository.sumRevenueByDateRange(companyId, quarterStart, todayEnd))
                .yearRevenue(invoiceRepository.sumRevenueByDateRange(companyId, yearStart, todayEnd))
                .totalProducts(itemRepository.countByCompanyIdAndIsActiveTrue(companyId))
                .totalBills(invoiceRepository.countByCompanyId(companyId))
                .totalCustomers(customerRepository.countByCompanyId(companyId))
                .lowStockProducts(itemRepository.countLowStockByCompanyId(companyId))
                .build();
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.SalesTrendPoint> getSalesTrend(Long companyId, int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        List<Object[]> rows = invoiceRepository.getDailySalesTrend(companyId, from);
        return rows.stream().map(row -> DashboardDTO.SalesTrendPoint.builder()
                .date(row[0].toString())
                .billCount(((Number) row[1]).longValue())
                .revenue(new BigDecimal(row[2].toString()))
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.MonthlyTrendPoint> getMonthlyTrend(Long companyId, int months) {
        LocalDateTime from = LocalDateTime.now().minusMonths(months);
        List<Object[]> rows = invoiceRepository.getMonthlyRevenueTrend(companyId, from);
        String[] monthNames = {"","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        return rows.stream().map(row -> {
            int month = ((Number) row[0]).intValue();
            int year = ((Number) row[1]).intValue();
            return DashboardDTO.MonthlyTrendPoint.builder()
                    .month(monthNames[month] + " " + year)
                    .year(year)
                    .billCount(((Number) row[2]).longValue())
                    .revenue(new BigDecimal(row[3].toString()))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.TopProduct> getTopProducts(Long companyId, int limit) {
        LocalDateTime from = LocalDateTime.now().minusMonths(12);
        LocalDateTime to = LocalDateTime.now();
        List<Object[]> rows = invoiceItemRepository.findTopSellingProducts(companyId, from, to, limit);
        return rows.stream().map(row -> DashboardDTO.TopProduct.builder()
                .itemId(((Number) row[0]).longValue())
                .itemName(row[2] != null ? row[2].toString() : "")
                .itemCode(row[1] != null ? row[1].toString() : "")
                .totalQty(new BigDecimal(row[3].toString()))
                .totalRevenue(new BigDecimal(row[4].toString()))
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.CategoryPerformance> getCategoryPerformance(Long companyId) {
        LocalDateTime from = LocalDateTime.now().minusMonths(12);
        LocalDateTime to = LocalDateTime.now();
        List<Object[]> rows = invoiceItemRepository.findCategoryPerformance(companyId, from, to);
        return rows.stream().map(row -> DashboardDTO.CategoryPerformance.builder()
                .categoryName(row[0].toString())
                .totalRevenue(new BigDecimal(row[1].toString()))
                .totalQty(new BigDecimal(row[2].toString()))
                .build()).collect(Collectors.toList());
    }
}
