package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.FiltreEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FiltreRepository extends CrudRepository<FiltreEntity, Integer> {

    Optional<FiltreEntity> findFiltreByNameAndCategorie(String name, String categorie);
}
