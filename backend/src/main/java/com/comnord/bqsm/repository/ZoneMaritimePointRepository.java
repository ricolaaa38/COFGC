package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.ZoneMaritimePoint;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZoneMaritimePointRepository extends CrudRepository<ZoneMaritimePoint, Integer> {
}
