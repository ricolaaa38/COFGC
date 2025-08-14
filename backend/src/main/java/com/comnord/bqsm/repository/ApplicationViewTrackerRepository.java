package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.ApplicationViewTrackerEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationViewTrackerRepository extends CrudRepository<ApplicationViewTrackerEntity, Integer> {
    @Query(value = "SELECT * FROM application_view_tracker a WHERE DATE(a.date) = :date AND a.user_email = :userEmail", nativeQuery = true)
    Optional<ApplicationViewTrackerEntity> findApplicationViewTrackerByDateAndUserEmail(@Param("date") LocalDateTime date, @Param("userEmail") String userEmail);

    @Query(value = "SELECT * FROM application_view_tracker a WHERE EXTRACT(DOW FROM a.date) = :dayOfWeek", nativeQuery = true)
    List<ApplicationViewTrackerEntity> findApplicationViewTrackerByDayOfWeek(@Param("dayOfWeek") int dayOfWeek);
}
