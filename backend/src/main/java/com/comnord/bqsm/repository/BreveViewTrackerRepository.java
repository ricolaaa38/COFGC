package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.BreveViewTrackerEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BreveViewTrackerRepository extends CrudRepository<BreveViewTrackerEntity, Integer> {
    List<BreveViewTrackerEntity> findViewTrackerByBreveId(BreveEntity breveId);

    Optional<BreveViewTrackerEntity> findViewTrackerByBreveIdAndUserEmail(BreveEntity breveId, String userEmail);
}
