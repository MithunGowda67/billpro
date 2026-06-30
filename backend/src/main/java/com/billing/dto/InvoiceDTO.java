package com.billing.dto;

import com.billing.entity.Invoice;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class InvoiceDTO {

    @Data
    public static class CreateRequest {
        private Long customerId;
        private String customerName;
        private String customerPhone;

        @NotEmpty(message = "Invoice must have at least one item")
        @Valid
        private List<LineItemRequest> items;

        private Invoice.DiscountType discountType = Invoice.DiscountType.NONE;
        private BigDecimal discountValue = BigDecimal.ZERO;

        @NotNull
        private Invoice.PaymentMethod paymentMethod = Invoice.PaymentMethod.CASH;
        private String notes;
    }

    @Data
    public static class LineItemRequest {
        @NotNull private Long itemId;
        @NotNull @DecimalMin("0.001") private BigDecimal quantity;
        private BigDecimal unitPrice; // optional override
    }

    @Data @Builder
    public static class Response {
        private Long id;
        private String invoiceNumber;
        private String customerName;
        private String customerPhone;
        private BigDecimal subtotal;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal grandTotal;
        private String paymentMethod;
        private String paymentStatus;
        private String notes;
        private String createdAt;
        private String createdByName;
        private List<LineItemResponse> items;
        private CompanyInfo company;
    }

    @Data @Builder
    public static class LineItemResponse {
        private Long id;
        private String itemCode;
        private String itemName;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal unitPrice;
        private BigDecimal taxPercentage;
        private BigDecimal taxAmount;
        private BigDecimal lineTotal;
    }

    @Data @Builder
    public static class CompanyInfo {
        private String name;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String phone;
        private String email;
        private String gstNumber;
        private String logoUrl;
        private String invoiceFooter;
        private String currencySymbol;
    }

    @Data @Builder
    public static class Summary {
        private Long id;
        private String invoiceNumber;
        private String customerName;
        private BigDecimal grandTotal;
        private String paymentMethod;
        private String paymentStatus;
        private String createdAt;
    }
}
