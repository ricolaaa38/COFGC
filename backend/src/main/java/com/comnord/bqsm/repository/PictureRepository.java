package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.PictureEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PictureRepository extends CrudRepository<PictureEntity, Integer> {
    List<PictureEntity> findAllPicturesByBreveId(BreveEntity breveId);

    Optional<PictureEntity> findPictureByBreveIdAndName(BreveEntity breveId, String name);
}
