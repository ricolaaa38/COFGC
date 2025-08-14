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

    @PostMapping("/create")
    public ResponseEntity<BreveViewTrackerEntity> createBreveViewTracker(@RequestBody BreveViewTrackerEntity breveViewTracker) {
        Optional<BreveViewTrackerEntity> alreadyExistEntry = breveViewTrackerRepository.findViewTrackerByBreveIdAndUserEmail(
                breveViewTracker.getBreveId(), breveViewTracker.getUserEmail()
        );
        if (alreadyExistEntry.isPresent()) {
            return ResponseEntity.status(HttpStatus.OK).body(alreadyExistEntry.get());
        } else {
            BreveViewTrackerEntity addBreveViewTracker = breveViewTrackerServices.saveBreveViewTracker(breveViewTracker);
            return ResponseEntity.status(HttpStatus.CREATED).body(addBreveViewTracker);
        }
    }
}
