package com.billing.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    @Data @Builder
    public static class Summary {
        // Sales counts & revenue
        private long todayBills;
        private BigDecimal todayRevenue;
        private long monthBills;
        private BigDecimal monthRevenue;
        private BigDecimal quarterRevenue;
        private BigDecimal yearRevenue;
        // Metrics
        private long totalProducts;
        private long totalBills;
        private long totalCustomers;
        private long lowStockProducts;
    }

    @Data @Builder
    public static class SalesTrendPoint {
        private String date;
        private long billCount;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class MonthlyTrendPoint {
        private String month;
        private int year;
        private long billCount;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class TopProduct {
        private Long itemId;
        private String itemCode;
        private String itemName;
        private BigDecimal totalQty;
        private BigDecimal totalRevenue;
    }

    @Data @Builder
    public static class CategoryPerformance {
        private String categoryName;
        private BigDecimal totalRevenue;
        private BigDecimal totalQty;
    }
}
