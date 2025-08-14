package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.DossierArborescenceEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DossierArborescenceRepository extends CrudRepository<DossierArborescenceEntity, Integer> {

    List<DossierArborescenceEntity> findByParentId(DossierArborescenceEntity parentId);

    Optional<DossierArborescenceEntity> findDossierByParentIdAndName(DossierArborescenceEntity parentId, String name);
}
