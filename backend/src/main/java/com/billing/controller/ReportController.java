package com.billing.controller;

import com.billing.dto.ReportDTO;
import com.billing.entity.User;
import com.billing.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ReportDTO.DailySales> getDaily(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyReport(user.getCompany().getId(),
                date != null ? date : LocalDate.now()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportDTO.MonthlySales> getMonthly(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        java.time.LocalDate now = java.time.LocalDate.now();
        return ResponseEntity.ok(reportService.getMonthlyReport(user.getCompany().getId(),
                year > 0 ? year : now.getYear(),
                month > 0 ? month : now.getMonthValue()));
    }

    @GetMapping("/quarterly")
    public ResponseEntity<ReportDTO.QuarterlySales> getQuarterly(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int quarter) {
        java.time.LocalDate now = java.time.LocalDate.now();
        int q = quarter > 0 ? quarter : ((now.getMonthValue() - 1) / 3 + 1);
        return ResponseEntity.ok(reportService.getQuarterlyReport(user.getCompany().getId(),
                year > 0 ? year : now.getYear(), q));
    }

    @GetMapping("/yearly")
    public ResponseEntity<ReportDTO.YearlySales> getYearly(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int year) {
        return ResponseEntity.ok(reportService.getYearlyReport(user.getCompany().getId(),
                year > 0 ? year : java.time.LocalDate.now().getYear()));
    }
}
