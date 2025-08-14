package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.LinkEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LinkRepository extends CrudRepository<LinkEntity, Integer> {

    List<LinkEntity> findAllLinksByBreveId(BreveEntity breveId);

    Optional<LinkEntity> findLinkByBreveIdAndLink(BreveEntity breveId, String link);

    Optional<LinkEntity> findLinkByBreveIdAndName(BreveEntity breveId, String name);
}
