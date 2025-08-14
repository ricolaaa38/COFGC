package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.IconByBreve;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IconByBreveRepository extends CrudRepository<IconByBreve, Integer> {
    List<IconByBreve> findAllIconByBreveId(BreveEntity breveId);
}
