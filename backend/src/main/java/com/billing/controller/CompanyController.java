package com.billing.controller;

import com.billing.entity.Company;
import com.billing.entity.User;
import com.billing.exception.ResourceNotFoundException;
import com.billing.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<Company> getCompany(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                companyRepository.findById(user.getCompany().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Company", user.getCompany().getId()))
        );
    }

    @PutMapping
    public ResponseEntity<Company> updateCompany(@RequestBody Map<String, Object> body,
                                                  @AuthenticationPrincipal User user) {
        Company company = companyRepository.findById(user.getCompany().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", user.getCompany().getId()));

        if (body.containsKey("name")) company.setName((String) body.get("name"));
        if (body.containsKey("address")) company.setAddress((String) body.get("address"));
        if (body.containsKey("city")) company.setCity((String) body.get("city"));
        if (body.containsKey("state")) company.setState((String) body.get("state"));
        if (body.containsKey("pincode")) company.setPincode((String) body.get("pincode"));
        if (body.containsKey("phone")) company.setPhone((String) body.get("phone"));
        if (body.containsKey("email")) company.setEmail((String) body.get("email"));
        if (body.containsKey("gstNumber")) company.setGstNumber((String) body.get("gstNumber"));
        if (body.containsKey("invoiceFooter")) company.setInvoiceFooter((String) body.get("invoiceFooter"));
        if (body.containsKey("currencySymbol")) company.setCurrencySymbol((String) body.get("currencySymbol"));
        if (body.containsKey("invoicePrefix")) company.setInvoicePrefix((String) body.get("invoicePrefix"));
        if (body.containsKey("taxRateDefault")) {
            company.setTaxRateDefault(new BigDecimal(body.get("taxRateDefault").toString()));
        }

        return ResponseEntity.ok(companyRepository.save(company));
    }
}
