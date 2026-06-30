package com.billing.service;

import com.billing.dto.InvoiceDTO;
import com.billing.entity.*;
import com.billing.exception.*;
import com.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final InvoiceSequenceRepository invoiceSequenceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ItemRepository itemRepository;
    private final CustomerRepository customerRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public InvoiceDTO.Response createInvoice(InvoiceDTO.CreateRequest request, Long companyId, Long userId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", companyId));
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Resolve or create customer
        Customer customer = resolveCustomer(request, companyId, company);

        // Build invoice items and validate stock
        List<InvoiceItem> invoiceItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (InvoiceDTO.LineItemRequest lineReq : request.getItems()) {
            Item item = itemRepository.findById(lineReq.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item", lineReq.getItemId()));

            if (!item.getIsActive()) {
                throw new BusinessException("Item '" + item.getName() + "' is not available.");
            }
            if (item.getQuantity().compareTo(lineReq.getQuantity()) < 0) {
                throw new BusinessException("Insufficient stock for '" + item.getName() +
                        "'. Available: " + item.getQuantity() + " " + item.getUnit().name());
            }

            BigDecimal unitPrice = lineReq.getUnitPrice() != null ? lineReq.getUnitPrice() : item.getSellingPrice();
            BigDecimal lineSubtotal = unitPrice.multiply(lineReq.getQuantity()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal taxAmt = lineSubtotal.multiply(item.getTaxPercentage())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            InvoiceItem ii = InvoiceItem.builder()
                    .item(item)
                    .itemCode(item.getItemCode())
                    .itemName(item.getName())
                    .quantity(lineReq.getQuantity())
                    .unit(item.getUnit().name())
                    .unitPrice(unitPrice)
                    .taxPercentage(item.getTaxPercentage())
                    .taxAmount(taxAmt)
                    .lineTotal(lineSubtotal.add(taxAmt))
                    .build();

            invoiceItems.add(ii);
            subtotal = subtotal.add(lineSubtotal);
            totalTax = totalTax.add(taxAmt);
        }

        // Calculate discount
        BigDecimal discountAmount = calculateDiscount(request, subtotal);

        BigDecimal grandTotal = subtotal.add(totalTax).subtract(discountAmount)
                .setScale(2, RoundingMode.HALF_UP);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;

        // Generate invoice number
        String invoiceNumber = generateInvoiceNumber(companyId, company.getInvoicePrefix());

        // Persist invoice
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .customerName(customer != null ? customer.getName() : request.getCustomerName())
                .customerPhone(customer != null ? customer.getPhone() : request.getCustomerPhone())
                .company(company)
                .createdBy(creator)
                .subtotal(subtotal)
                .discountType(request.getDiscountType() != null ? request.getDiscountType() : Invoice.DiscountType.NONE)
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .discountAmount(discountAmount)
                .taxAmount(totalTax)
                .grandTotal(grandTotal)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentMethod() == Invoice.PaymentMethod.CREDIT
                        ? Invoice.PaymentStatus.PENDING : Invoice.PaymentStatus.PAID)
                .notes(request.getNotes())
                .build();

        invoice = invoiceRepository.save(invoice);

        // Save invoice items and reduce stock
        for (int i = 0; i < invoiceItems.size(); i++) {
            InvoiceItem ii = invoiceItems.get(i);
            ii.setInvoice(invoice);
            invoiceItemRepository.save(ii);

            // Reduce stock
            Item item = ii.getItem();
            BigDecimal qtyBefore = item.getQuantity();
            BigDecimal qtyAfter = qtyBefore.subtract(ii.getQuantity());
            item.setQuantity(qtyAfter);
            itemRepository.save(item);

            // Record stock movement
            StockMovement movement = StockMovement.builder()
                    .item(item)
                    .movementType(StockMovement.MovementType.SALE)
                    .quantityChange(ii.getQuantity().negate())
                    .quantityBefore(qtyBefore)
                    .quantityAfter(qtyAfter)
                    .referenceId(invoice.getId())
                    .referenceType("INVOICE")
                    .notes("Sale - Invoice: " + invoiceNumber)
                    .createdBy(creator)
                    .build();
            stockMovementRepository.save(movement);
        }

        // Update customer stats
        if (customer != null) {
            if (customer.getTotalPurchases() == null) {
                customer.setTotalPurchases(BigDecimal.ZERO);
            }
            if (customer.getTotalInvoices() == null) {
                customer.setTotalInvoices(0);
            }
            customer.setTotalPurchases(customer.getTotalPurchases().add(grandTotal));
            customer.setTotalInvoices(customer.getTotalInvoices() + 1);
            customerRepository.save(customer);
        }

        return toResponse(invoice, invoiceItems);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDTO.Summary> searchInvoices(Long companyId, LocalDateTime from, LocalDateTime to,
                                                     Long customerId, String paymentMethod, String invoiceNumber,
                                                     int page, int size) {
        Invoice.PaymentMethod pm = paymentMethod != null ? Invoice.PaymentMethod.valueOf(paymentMethod) : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return invoiceRepository.searchInvoices(companyId, from, to, customerId, pm, invoiceNumber, pageable)
                .map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public InvoiceDTO.Response getInvoice(Long id, Long companyId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        if (!invoice.getCompany().getId().equals(companyId)) {
            throw new ResourceNotFoundException("Invoice", id);
        }
        return toResponse(invoice, invoice.getItems());
    }

    private Customer resolveCustomer(InvoiceDTO.CreateRequest request, Long companyId, Company company) {
        if (request.getCustomerId() != null) {
            return customerRepository.findById(request.getCustomerId()).orElse(null);
        }
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()) {
            return customerRepository.findByPhoneAndCompanyId(request.getCustomerPhone(), companyId)
                    .orElseGet(() -> {
                        Customer newCust = Customer.builder()
                                .name(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Customer")
                                .phone(request.getCustomerPhone())
                                .company(company)
                                .build();
                        return customerRepository.save(newCust);
                    });
        }
        return null;
    }

    private BigDecimal calculateDiscount(InvoiceDTO.CreateRequest request, BigDecimal subtotal) {
        if (request.getDiscountType() == null || request.getDiscountType() == Invoice.DiscountType.NONE) {
            return BigDecimal.ZERO;
        }
        if (request.getDiscountType() == Invoice.DiscountType.PERCENT) {
            return subtotal.multiply(request.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        return request.getDiscountValue().setScale(2, RoundingMode.HALF_UP);
    }

    private String generateInvoiceNumber(Long companyId, String prefix) {
        int year = java.time.Year.now().getValue();
        InvoiceSequence seq = invoiceSequenceRepository.findByCompanyIdAndYearForUpdate(companyId, year)
                .orElseGet(() -> {
                    Company company = companyRepository.findById(companyId).orElseThrow();
                    InvoiceSequence newSeq = new InvoiceSequence();
                    newSeq.setCompany(company);
                    newSeq.setYear(year);
                    newSeq.setLastSequence(0L);
                    return invoiceSequenceRepository.save(newSeq);
                });
        long next = seq.getLastSequence() + 1;
        seq.setLastSequence(next);
        invoiceSequenceRepository.save(seq);
        return String.format("%s-%d-%06d", prefix != null ? prefix : "INV", year, next);
    }

    private InvoiceDTO.Response toResponse(Invoice invoice, List<InvoiceItem> items) {
        Company company = invoice.getCompany();
        List<InvoiceDTO.LineItemResponse> lineItems = items.stream().map(ii ->
                InvoiceDTO.LineItemResponse.builder()
                        .id(ii.getId())
                        .itemCode(ii.getItemCode())
                        .itemName(ii.getItemName())
                        .quantity(ii.getQuantity())
                        .unit(ii.getUnit())
                        .unitPrice(ii.getUnitPrice())
                        .taxPercentage(ii.getTaxPercentage())
                        .taxAmount(ii.getTaxAmount())
                        .lineTotal(ii.getLineTotal())
                        .build()
        ).collect(Collectors.toList());

        return InvoiceDTO.Response.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerName(invoice.getCustomerName())
                .customerPhone(invoice.getCustomerPhone())
                .subtotal(invoice.getSubtotal())
                .discountType(invoice.getDiscountType().name())
                .discountValue(invoice.getDiscountValue())
                .discountAmount(invoice.getDiscountAmount())
                .taxAmount(invoice.getTaxAmount())
                .grandTotal(invoice.getGrandTotal())
                .paymentMethod(invoice.getPaymentMethod().name())
                .paymentStatus(invoice.getPaymentStatus().name())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt() != null ? invoice.getCreatedAt().toString() : null)
                .createdByName(invoice.getCreatedBy() != null ? invoice.getCreatedBy().getFullName() : null)
                .items(lineItems)
                .company(InvoiceDTO.CompanyInfo.builder()
                        .name(company.getName())
                        .address(company.getAddress())
                        .city(company.getCity())
                        .state(company.getState())
                        .pincode(company.getPincode())
                        .phone(company.getPhone())
                        .email(company.getEmail())
                        .gstNumber(company.getGstNumber())
                        .logoUrl(company.getLogoUrl())
                        .invoiceFooter(company.getInvoiceFooter())
                        .currencySymbol(company.getCurrencySymbol())
                        .build())
                .build();
    }

    private InvoiceDTO.Summary toSummary(Invoice invoice) {
        return InvoiceDTO.Summary.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerName(invoice.getCustomerName())
                .grandTotal(invoice.getGrandTotal())
                .paymentMethod(invoice.getPaymentMethod().name())
                .paymentStatus(invoice.getPaymentStatus().name())
                .createdAt(invoice.getCreatedAt() != null ? invoice.getCreatedAt().toString() : null)
                .build();
    }
}
