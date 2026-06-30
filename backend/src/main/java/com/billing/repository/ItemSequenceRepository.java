package com.billing.repository;

import com.billing.entity.ItemSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface ItemSequenceRepository extends JpaRepository<ItemSequence, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ItemSequence s WHERE s.company.id = :companyId")
    Optional<ItemSequence> findByCompanyIdForUpdate(@Param("companyId") Long companyId);
}
