package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.model.FichierArborescenceEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FichierArborescenceRepository extends CrudRepository<FichierArborescenceEntity, Integer> {

    List<FichierArborescenceEntity> findFilesByParentId(DossierArborescenceEntity parentId);

    Optional<FichierArborescenceEntity> findFileByparentIdAndName(DossierArborescenceEntity parentId, String name);
}
