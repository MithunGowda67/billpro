package com.billing.controller;

import com.billing.entity.User;
import com.billing.exception.BusinessException;
import com.billing.exception.ResourceNotFoundException;
import com.billing.repository.CompanyRepository;
import com.billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userRepository.findByCompanyId(user.getCompany().getId()));
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody Map<String, String> body,
                                        @AuthenticationPrincipal User currentUser) {
        if (userRepository.existsByUsername(body.get("username"))) {
            throw new BusinessException("Username already exists");
        }
        if (userRepository.existsByEmail(body.get("email"))) {
            throw new BusinessException("Email already exists");
        }

        User user = User.builder()
                .username(body.get("username"))
                .email(body.get("email"))
                .passwordHash(passwordEncoder.encode(body.getOrDefault("password", "changeme123")))
                .fullName(body.get("fullName"))
                .role(User.Role.valueOf(body.getOrDefault("role", "BILLING_STAFF")))
                .company(companyRepository.findById(currentUser.getCompany().getId()).orElseThrow())
                .isActive(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("email")) user.setEmail(body.get("email"));
        if (body.containsKey("role")) user.setRole(User.Role.valueOf(body.get("role")));
        if (body.containsKey("password")) user.setPasswordHash(passwordEncoder.encode(body.get("password")));
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<User> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(!user.getIsActive());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
