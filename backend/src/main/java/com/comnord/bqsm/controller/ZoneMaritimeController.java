package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.ZoneMaritime;
import com.comnord.bqsm.model.dto.ZoneDTO;
import com.comnord.bqsm.service.ZoneMaritimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones-maritime")
public class ZoneMaritimeController {

    @Autowired
    private ZoneMaritimeService zoneMaritimeService;

    @PostMapping("/create")
    public ResponseEntity<ZoneMaritime> createZone(@RequestBody ZoneDTO zoneDto) {
        ZoneMaritime created = zoneMaritimeService.createZoneMaritime(zoneDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/")
    public ResponseEntity<List<ZoneMaritime>> getAllZones() {
        List<ZoneMaritime> zones = zoneMaritimeService.getAllZonesMaritimes();
        return ResponseEntity.ok(zones);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteZone(@RequestParam int id) {
        zoneMaritimeService.deleteZoneMaritime(id);
        return ResponseEntity.ok("Zone maritime supprimée");
    }
}
