package com.billing.service;

import com.billing.dto.ReportDTO;
import com.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    private static final String[] MONTH_NAMES = {"","January","February","March","April","May","June",
            "July","August","September","October","November","December"};

    @Transactional(readOnly = true)
    public ReportDTO.DailySales getDailyReport(Long companyId, java.time.LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.atTime(23, 59, 59);

        BigDecimal revenue = invoiceRepository.sumRevenueByDateRange(companyId, from, to);
        BigDecimal discounts = invoiceRepository.sumDiscountsByDateRange(companyId, from, to);
        BigDecimal taxes = invoiceRepository.sumTaxesByDateRange(companyId, from, to);
        long billCount = invoiceRepository.countByDateRange(companyId, from, to);
        BigDecimal netRevenue = revenue.subtract(taxes);

        List<com.billing.dto.InvoiceDTO.Summary> invoices = invoiceRepository
                .searchInvoices(companyId, from, to, null, null, null,
                        PageRequest.of(0, 200, Sort.by("createdAt").descending()))
                .stream().map(inv -> com.billing.dto.InvoiceDTO.Summary.builder()
                        .id(inv.getId())
                        .invoiceNumber(inv.getInvoiceNumber())
                        .customerName(inv.getCustomerName())
                        .grandTotal(inv.getGrandTotal())
                        .paymentMethod(inv.getPaymentMethod().name())
                        .paymentStatus(inv.getPaymentStatus().name())
                        .createdAt(inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        return ReportDTO.DailySales.builder()
                .date(date.toString())
                .billCount(billCount)
                .revenue(revenue)
                .discounts(discounts)
                .taxes(taxes)
                .netRevenue(netRevenue)
                .invoices(invoices)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDTO.MonthlySales getMonthlyReport(Long companyId, int year, int month) {
        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime to = from.withDayOfMonth(from.toLocalDate().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        BigDecimal revenue = invoiceRepository.sumRevenueByDateRange(companyId, from, to);
        BigDecimal discounts = invoiceRepository.sumDiscountsByDateRange(companyId, from, to);
        BigDecimal taxes = invoiceRepository.sumTaxesByDateRange(companyId, from, to);
        long billCount = invoiceRepository.countByDateRange(companyId, from, to);

        List<Object[]> topRows = invoiceItemRepository.findTopSellingProducts(companyId, from, to, 10);
        List<ReportDTO.ProductPerformance> topProducts = topRows.stream().map(row ->
                ReportDTO.ProductPerformance.builder()
                        .itemCode(row[1] != null ? row[1].toString() : "")
                        .itemName(row[2] != null ? row[2].toString() : "")
                        .totalQty(new BigDecimal(row[3].toString()))
                        .totalRevenue(new BigDecimal(row[4].toString()))
                        .build()).collect(Collectors.toList());

        return ReportDTO.MonthlySales.builder()
                .year(year).month(month)
                .monthName(MONTH_NAMES[month])
                .billCount(billCount)
                .revenue(revenue)
                .discounts(discounts)
                .taxes(taxes)
                .topProducts(topProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDTO.QuarterlySales getQuarterlyReport(Long companyId, int year, int quarter) {
        int startMonth = (quarter - 1) * 3 + 1;
        LocalDateTime from = LocalDate.of(year, startMonth, 1).atStartOfDay();
        LocalDateTime to = LocalDate.of(year, startMonth + 2, 1)
                .withDayOfMonth(LocalDate.of(year, startMonth + 2, 1).lengthOfMonth())
                .atTime(23, 59, 59);

        BigDecimal revenue = invoiceRepository.sumRevenueByDateRange(companyId, from, to);

        // Previous quarter
        int prevQuarter = quarter == 1 ? 4 : quarter - 1;
        int prevYear = quarter == 1 ? year - 1 : year;
        int prevStartMonth = (prevQuarter - 1) * 3 + 1;
        LocalDateTime prevFrom = LocalDate.of(prevYear, prevStartMonth, 1).atStartOfDay();
        LocalDateTime prevTo = LocalDate.of(prevYear, prevStartMonth + 2, 1)
                .withDayOfMonth(LocalDate.of(prevYear, prevStartMonth + 2, 1).lengthOfMonth())
                .atTime(23, 59, 59);
        BigDecimal prevRevenue = invoiceRepository.sumRevenueByDateRange(companyId, prevFrom, prevTo);

        BigDecimal growth = BigDecimal.ZERO;
        if (prevRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = revenue.subtract(prevRevenue).multiply(BigDecimal.valueOf(100))
                    .divide(prevRevenue, 2, RoundingMode.HALF_UP);
        }

        List<Object[]> bestRows = invoiceItemRepository.findTopSellingProducts(companyId, from, to, 10);
        List<ReportDTO.ProductPerformance> bestSellers = bestRows.stream().map(row ->
                ReportDTO.ProductPerformance.builder()
                        .itemCode(row[1] != null ? row[1].toString() : "")
                        .itemName(row[2] != null ? row[2].toString() : "")
                        .totalQty(new BigDecimal(row[3].toString()))
                        .totalRevenue(new BigDecimal(row[4].toString()))
                        .build()).collect(Collectors.toList());

        List<Object[]> catRows = invoiceItemRepository.findCategoryPerformance(companyId, from, to);
        List<com.billing.dto.DashboardDTO.CategoryPerformance> catPerf = catRows.stream().map(row ->
                com.billing.dto.DashboardDTO.CategoryPerformance.builder()
                        .categoryName(row[0].toString())
                        .totalRevenue(new BigDecimal(row[1].toString()))
                        .totalQty(new BigDecimal(row[2].toString()))
                        .build()).collect(Collectors.toList());

        return ReportDTO.QuarterlySales.builder()
                .year(year).quarter(quarter)
                .revenue(revenue)
                .previousQuarterRevenue(prevRevenue)
                .growthPercent(growth)
                .bestSellers(bestSellers)
                .categoryPerformance(catPerf)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportDTO.YearlySales getYearlyReport(Long companyId, int year) {
        LocalDateTime from = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime to = LocalDate.of(year, 12, 31).atTime(23, 59, 59);

        BigDecimal revenue = invoiceRepository.sumRevenueByDateRange(companyId, from, to);
        BigDecimal taxes = invoiceRepository.sumTaxesByDateRange(companyId, from, to);
        BigDecimal discounts = invoiceRepository.sumDiscountsByDateRange(companyId, from, to);

        List<ReportDTO.MonthlyBreakdown> monthlyBreakdown = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            LocalDateTime mFrom = LocalDate.of(year, m, 1).atStartOfDay();
            LocalDateTime mTo = LocalDate.of(year, m, LocalDate.of(year, m, 1).lengthOfMonth()).atTime(23, 59, 59);
            BigDecimal mRevenue = invoiceRepository.sumRevenueByDateRange(companyId, mFrom, mTo);
            long mCount = invoiceRepository.countByDateRange(companyId, mFrom, mTo);
            monthlyBreakdown.add(ReportDTO.MonthlyBreakdown.builder()
                    .month(m).monthName(MONTH_NAMES[m])
                    .revenue(mRevenue).profit(mRevenue.multiply(BigDecimal.valueOf(0.3)))
                    .billCount(mCount).build());
        }

        List<Object[]> topRows = invoiceItemRepository.findTopSellingProducts(companyId, from, to, 10);
        List<ReportDTO.ProductPerformance> topProducts = topRows.stream().map(row ->
                ReportDTO.ProductPerformance.builder()
                        .itemCode(row[1] != null ? row[1].toString() : "")
                        .itemName(row[2] != null ? row[2].toString() : "")
                        .totalQty(new BigDecimal(row[3].toString()))
                        .totalRevenue(new BigDecimal(row[4].toString()))
                        .build()).collect(Collectors.toList());

        return ReportDTO.YearlySales.builder()
                .year(year)
                .revenue(revenue)
                .taxes(taxes)
                .discounts(discounts)
                .profit(revenue.multiply(BigDecimal.valueOf(0.3)))
                .monthlyBreakdown(monthlyBreakdown)
                .topProducts(topProducts)
                .build();
    }
}
