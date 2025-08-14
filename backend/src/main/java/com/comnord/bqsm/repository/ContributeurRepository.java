package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.ContributeurEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContributeurRepository extends CrudRepository<ContributeurEntity, Integer> {
    List<ContributeurEntity> findAllContributeursByBreveId(BreveEntity breveId);
}
