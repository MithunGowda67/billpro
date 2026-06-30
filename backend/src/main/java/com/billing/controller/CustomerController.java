package com.billing.controller;

import com.billing.entity.Customer;
import com.billing.entity.User;
import com.billing.exception.ResourceNotFoundException;
import com.billing.repository.CustomerRepository;
import com.billing.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<Page<Customer>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(customerRepository.searchCustomers(user.getCompany().getId(), search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> get(@PathVariable Long id) {
        return ResponseEntity.ok(customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id)));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Map<String, String> body,
                                            @AuthenticationPrincipal User user) {
        Customer customer = Customer.builder()
                .name(body.get("name"))
                .phone(body.get("phone"))
                .email(body.get("email"))
                .address(body.get("address"))
                .gstNumber(body.get("gstNumber"))
                .company(companyRepository.findById(user.getCompany().getId()).orElseThrow())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        if (body.containsKey("name")) customer.setName(body.get("name"));
        if (body.containsKey("phone")) customer.setPhone(body.get("phone"));
        if (body.containsKey("email")) customer.setEmail(body.get("email"));
        if (body.containsKey("address")) customer.setAddress(body.get("address"));
        if (body.containsKey("gstNumber")) customer.setGstNumber(body.get("gstNumber"));
        return ResponseEntity.ok(customerRepository.save(customer));
    }
}
