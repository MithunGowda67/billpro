package com.billing.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class ReportDTO {

    @Data @Builder
    public static class DailySales {
        private String date;
        private long billCount;
        private BigDecimal revenue;
        private BigDecimal discounts;
        private BigDecimal taxes;
        private BigDecimal netRevenue;
        private List<InvoiceDTO.Summary> invoices;
    }

    @Data @Builder
    public static class MonthlySales {
        private int year;
        private int month;
        private String monthName;
        private long billCount;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
        private BigDecimal discounts;
        private BigDecimal taxes;
        private List<ProductPerformance> topProducts;
    }

    @Data @Builder
    public static class QuarterlySales {
        private int year;
        private int quarter;
        private BigDecimal revenue;
        private BigDecimal previousQuarterRevenue;
        private BigDecimal growthPercent;
        private List<ProductPerformance> bestSellers;
        private List<DashboardDTO.CategoryPerformance> categoryPerformance;
    }

    @Data @Builder
    public static class YearlySales {
        private int year;
        private BigDecimal revenue;
        private BigDecimal cost;
        private BigDecimal profit;
        private BigDecimal taxes;
        private BigDecimal discounts;
        private List<MonthlyBreakdown> monthlyBreakdown;
        private List<ProductPerformance> topProducts;
    }

    @Data @Builder
    public static class MonthlyBreakdown {
        private int month;
        private String monthName;
        private BigDecimal revenue;
        private BigDecimal profit;
        private long billCount;
    }

    @Data @Builder
    public static class ProductPerformance {
        private String itemCode;
        private String itemName;
        private BigDecimal totalQty;
        private BigDecimal totalRevenue;
    }
}
