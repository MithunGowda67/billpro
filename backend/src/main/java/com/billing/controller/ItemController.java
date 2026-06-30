package com.billing.controller;

import com.billing.dto.ItemDTO;
import com.billing.entity.User;
import com.billing.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<Page<ItemDTO.Response>> getItems(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(itemService.getItems(user.getCompany().getId(), search, categoryId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO.Response> getItem(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.getItem(id, user.getCompany().getId()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ItemDTO.Response>> getLowStock(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.getLowStockItems(user.getCompany().getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemDTO.SearchResult>> searchForBilling(
            @AuthenticationPrincipal User user,
            @RequestParam String q) {
        return ResponseEntity.ok(itemService.searchForBilling(user.getCompany().getId(), q));
    }

    @PostMapping
    public ResponseEntity<ItemDTO.Response> createItem(@Valid @RequestBody ItemDTO.CreateRequest request,
                                                        @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itemService.createItem(request, user.getCompany().getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO.Response> updateItem(@PathVariable Long id,
                                                        @RequestBody ItemDTO.UpdateRequest request,
                                                        @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(itemService.updateItem(id, request, user.getCompany().getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, @AuthenticationPrincipal User user) {
        itemService.deleteItem(id, user.getCompany().getId());
        return ResponseEntity.noContent().build();
    }
}
