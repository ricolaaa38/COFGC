package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.ApplicationViewTrackerEntity;
import com.comnord.bqsm.repository.ApplicationViewTrackerRepository;
import com.comnord.bqsm.service.ApplicationViewTrackerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public ResponseEntity<ApplicationViewTrackerEntity> createApplicationViewTracker(@RequestBody ApplicationViewTrackerEntity applicationViewTracker) {
        LocalDateTime currentDate = LocalDate.now().atStartOfDay();
        Optional<ApplicationViewTrackerEntity> alreadyExistEntry = applicationViewTrackerRepository.findApplicationViewTrackerByDateAndUserEmail(
                currentDate, applicationViewTracker.getUserEmail()
        );
        if (alreadyExistEntry.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(alreadyExistEntry.get());
        } else {
            ApplicationViewTrackerEntity addApplicationViewTracker = applicationViewTrackerServices.saveApplicationViewTracker(applicationViewTracker);
            return ResponseEntity.status(HttpStatus.CREATED).body(addApplicationViewTracker);
        }
    }
}
