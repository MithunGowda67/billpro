package com.billing.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_sequences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemSequence {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", unique = true)
    private Company company;

    @Column(name = "last_sequence", nullable = false)
    private Long lastSequence = 0L;
}
