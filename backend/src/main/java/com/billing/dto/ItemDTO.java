package com.billing.dto;

import com.billing.entity.Item;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ItemDTO {

    @Data
    public static class CreateRequest {
        @NotBlank private String name;
        private String description;
        private Long categoryId;  // optional
        @NotNull @DecimalMin("0") private BigDecimal purchasePrice;
        @NotNull @DecimalMin("0") private BigDecimal sellingPrice;
        @NotNull @DecimalMin("0") private BigDecimal quantity;
        private Item.Unit unit = Item.Unit.PIECE;
        @DecimalMin("0") @DecimalMax("100") private BigDecimal taxPercentage = BigDecimal.ZERO;
        @DecimalMin("0") private BigDecimal minStockThreshold = BigDecimal.TEN;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private String description;
        private Long categoryId;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPrice;
        private BigDecimal quantity;
        private Item.Unit unit;
        private BigDecimal taxPercentage;
        private BigDecimal minStockThreshold;
        private Boolean isActive;
    }

    @Data @Builder
    public static class Response {
        private Long id;
        private String itemCode;
        private String name;
        private String description;
        private Long categoryId;
        private String categoryName;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPrice;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal taxPercentage;
        private BigDecimal minStockThreshold;
        private Boolean isActive;
        private Boolean isLowStock;
        private String dateAdded;
        private String createdAt;
    }

    @Data @Builder
    public static class SearchResult {
        private Long id;
        private String itemCode;
        private String name;
        private BigDecimal sellingPrice;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal taxPercentage;
        private Boolean isLowStock;
    }
}
