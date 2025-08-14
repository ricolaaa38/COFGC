package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.IconEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IconRepository extends CrudRepository<IconEntity, Integer> {

}
