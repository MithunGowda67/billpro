package com.billing.controller;

import com.billing.dto.DashboardDTO;
import com.billing.entity.User;
import com.billing.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO.Summary> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getSummary(user.getCompany().getId()));
    }

    @GetMapping("/sales-trend")
    public ResponseEntity<List<DashboardDTO.SalesTrendPoint>> getSalesTrend(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getSalesTrend(user.getCompany().getId(), days));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<DashboardDTO.MonthlyTrendPoint>> getMonthlyTrend(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(dashboardService.getMonthlyTrend(user.getCompany().getId(), months));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<DashboardDTO.TopProduct>> getTopProducts(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopProducts(user.getCompany().getId(), limit));
    }

    @GetMapping("/category-performance")
    public ResponseEntity<List<DashboardDTO.CategoryPerformance>> getCategoryPerformance(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getCategoryPerformance(user.getCompany().getId()));
    }
}
