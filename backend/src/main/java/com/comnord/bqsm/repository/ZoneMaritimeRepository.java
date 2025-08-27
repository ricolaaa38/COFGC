package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.ZoneMaritime;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZoneMaritimeRepository extends CrudRepository<ZoneMaritime, Integer> {
}
