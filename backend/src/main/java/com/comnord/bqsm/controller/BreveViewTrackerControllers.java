package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.BreveViewTrackerEntity;
import com.comnord.bqsm.repository.BreveViewTrackerRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.BreveViewTrackerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/breveviewtracker")
public class BreveViewTrackerControllers {

    @Autowired
    private BreveViewTrackerServices breveViewTrackerServices;

    @Autowired
    private BreveViewTrackerRepository breveViewTrackerRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<BreveViewTrackerEntity>> getBreveViewTrackerByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<BreveViewTrackerEntity> breveViewTracker = breveViewTrackerServices.getBreveViewTrackerByBreveId(breve);
        return ResponseEntity.ok(breveViewTracker);
    }

    @GetMapping("/hasViewed")
    public ResponseEntity<Boolean> hasUserViewedBreve(
            @RequestParam int breveId,
            @RequestParam String userEmail) {
        boolean hasViewed = breveViewTrackerServices.hasUserViewedBreve(breveId, userEmail);
        return ResponseEntity.ok(hasViewed);
    }

    @PostMapping("/create")
    public ResponseEntity<BreveViewTrackerEntity> createBreveViewTracker(
            @RequestParam int breveId,
            @RequestParam String userEmail) {

        BreveEntity breve = breveServices.getBreveById(breveId);

        Optional<BreveViewTrackerEntity> alreadyExistEntry = breveViewTrackerRepository.findViewTrackerByBreveIdAndUserEmail(
                breve, userEmail
        );
        if (alreadyExistEntry.isPresent()) {
            BreveViewTrackerEntity existingEntry = alreadyExistEntry.get();
            existingEntry.setViewCount(existingEntry.getViewCount() + 1);
            breveViewTrackerServices.saveBreveViewTracker(existingEntry);
            return ResponseEntity.status(HttpStatus.OK).body(existingEntry);
        } else {
            BreveViewTrackerEntity entity = new BreveViewTrackerEntity();
            entity.setBreveId(breve);
            entity.setUserEmail(userEmail);
            entity.setDate(java.time.LocalDateTime.now());
            BreveViewTrackerEntity saved = breveViewTrackerRepository.save(entity);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }
    }
}
