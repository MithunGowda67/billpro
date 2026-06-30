package com.billing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "invoice_sequences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceSequence {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "last_sequence", nullable = false)
    private Long lastSequence = 0L;
}
