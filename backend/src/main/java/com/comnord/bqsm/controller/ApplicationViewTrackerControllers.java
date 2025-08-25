package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.ApplicationViewTrackerEntity;
import com.comnord.bqsm.model.dto.ConnectionStatsDTO;
import com.comnord.bqsm.repository.ApplicationViewTrackerRepository;
import com.comnord.bqsm.service.ApplicationViewTrackerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/applicationviewtracker")
public class ApplicationViewTrackerControllers {

    @Autowired
    private ApplicationViewTrackerServices applicationViewTrackerServices;

    @Autowired
    private ApplicationViewTrackerRepository applicationViewTrackerRepository;

    @GetMapping("/")
    public ResponseEntity<Iterable<ApplicationViewTrackerEntity>> getAllApplicationViewTrackers() {
        return ResponseEntity.ok(applicationViewTrackerServices.getAllApplicationViewTrackers());
    }

    @GetMapping("/dayofweek")
    public ResponseEntity<Iterable<ApplicationViewTrackerEntity>> getApplicationViewTrackerByDayOfWeek(int dayOfWeek) {
        return ResponseEntity.ok(applicationViewTrackerServices.getApplicationViewTrackerByDayOfWeek(dayOfWeek));
    }

    @PostMapping("/create")
    public ResponseEntity<ApplicationViewTrackerEntity> createApplicationViewTracker(@RequestParam String userEmail) {

        LocalDate currentDate = LocalDate.now();
        java.sql.Date sqlDate = java.sql.Date.valueOf(currentDate);
        Optional<ApplicationViewTrackerEntity> alreadyExistEntry = applicationViewTrackerRepository.findApplicationViewTrackerByDateAndUserEmail(sqlDate, userEmail);
        if (alreadyExistEntry.isPresent()) {
            ApplicationViewTrackerEntity existingEntry = alreadyExistEntry.get();
            existingEntry.setConnectionCount(existingEntry.getConnectionCount() + 1);
            applicationViewTrackerServices.saveApplicationViewTracker(existingEntry);
            return ResponseEntity.status(HttpStatus.OK).body(existingEntry);
        } else {
            ApplicationViewTrackerEntity applicationViewTracker = new ApplicationViewTrackerEntity();
            applicationViewTracker.setUserEmail(userEmail);
            applicationViewTracker.setConnectionCount(1);
            ApplicationViewTrackerEntity addApplicationViewTracker = applicationViewTrackerServices.saveApplicationViewTracker(applicationViewTracker);
            return ResponseEntity.status(HttpStatus.CREATED).body(addApplicationViewTracker);
        }
    }

    @GetMapping("/total-connection-per-days")
    public ResponseEntity<List<Map.Entry<LocalDate, Integer>>> getTotalConnectionPerDays() {
        return ResponseEntity.ok(applicationViewTrackerServices.getTotalConnectionPerDays());
    }

    @GetMapping("/connection-stats")
    public ResponseEntity<ConnectionStatsDTO> getConnectionStats() {
        return ResponseEntity.ok(applicationViewTrackerServices.getConnectionStats());
    }

    @GetMapping("/connection-per-dayofweek-year")
    public ResponseEntity<Map<String, Integer>> getConnectionPerDayOfWeekMonthAndYear() {
        return ResponseEntity.ok(applicationViewTrackerServices.getTotalConnectionPerDayOfWeekAndYear());
    }

    @PostMapping("/insert-fake")
    public ResponseEntity<Void> insertFake(@RequestParam String userEmail, @RequestParam String date, @RequestParam int connectionCount) {
        LocalDateTime fakeDate = LocalDateTime.parse(date);
        applicationViewTrackerServices.insertFakeApplicationViewTracker(userEmail, fakeDate, connectionCount);
        return ResponseEntity.ok().build();
    }
}
