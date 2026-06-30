package com.billing.controller;

import com.billing.dto.InvoiceDTO;
import com.billing.entity.User;
import com.billing.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceDTO.Response> createInvoice(@Valid @RequestBody InvoiceDTO.CreateRequest request,
                                                               @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(request, user.getCompany().getId(), user.getId()));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceDTO.Summary>> getInvoices(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) String invoiceNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(invoiceService.searchInvoices(
                user.getCompany().getId(), from, to, customerId, paymentMethod, invoiceNumber, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO.Response> getInvoice(@PathVariable Long id,
                                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(invoiceService.getInvoice(id, user.getCompany().getId()));
    }
}
