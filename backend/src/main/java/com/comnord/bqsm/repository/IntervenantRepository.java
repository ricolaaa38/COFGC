package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.IntervenantEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntervenantRepository extends CrudRepository<IntervenantEntity, Integer> {
    List<IntervenantEntity> findAllIntervenantsByBreveId(BreveEntity breveId);
}
