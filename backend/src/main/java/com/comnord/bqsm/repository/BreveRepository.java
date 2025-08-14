package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BreveRepository extends CrudRepository<BreveEntity, Integer>, JpaSpecificationExecutor<BreveEntity> {
    Page<BreveEntity> findAllByOrderByDateDesc(Pageable pageable);
}
