package com.billing.controller;

import com.billing.entity.Category;
import com.billing.entity.User;
import com.billing.exception.ResourceNotFoundException;
import com.billing.repository.CategoryRepository;
import com.billing.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;

    // DTO to avoid lazy-loading Company when serializing
    public record CategoryDTO(Long id, String name, String description, String createdAt) {}

    private CategoryDTO toDto(Category c) {
        return new CategoryDTO(
                c.getId(),
                c.getName(),
                c.getDescription(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
        );
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAll(@AuthenticationPrincipal User user) {
        List<CategoryDTO> list = categoryRepository
                .findByCompanyIdOrderByNameAsc(user.getCompany().getId())
                .stream().map(this::toDto).toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> create(@RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal User user) {
        Category cat = new Category();
        cat.setName(body.get("name"));
        cat.setDescription(body.get("description"));
        cat.setCompany(companyRepository.findById(user.getCompany().getId()).orElseThrow());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(categoryRepository.save(cat)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> update(@PathVariable Long id,
                                               @RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal User user) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (body.containsKey("name")) cat.setName(body.get("name"));
        if (body.containsKey("description")) cat.setDescription(body.get("description"));
        return ResponseEntity.ok(toDto(categoryRepository.save(cat)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
