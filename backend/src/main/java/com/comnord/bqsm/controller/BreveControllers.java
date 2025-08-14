package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.dto.BreveCoordDTO;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.WordDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/breves")
public class BreveControllers {

    @Autowired
    private BreveServices breveServices;

    @Autowired
    private WordDocumentService wordDocumentService;

    @GetMapping("/")
    public ResponseEntity<Iterable<BreveEntity>> getAllBreves() {
       return ResponseEntity.ok(breveServices.getAllBreves());
    }

    @GetMapping("/id")
    public ResponseEntity<BreveEntity> getBreveById(@RequestParam int id) {
        BreveEntity breve = breveServices.getBreveById(id);
        return ResponseEntity.ok(breve);
    }

    @GetMapping("/all-coords")
    public ResponseEntity<List<BreveCoordDTO>> getAllCoordsForMap(
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String intervenant,
            @RequestParam(required = false) String contributeur,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String date
    ) {
        List<BreveEntity> breves = breveServices.getAllBrevesForMap(zone, categorie, intervenant, contributeur, startDate, endDate, date);
        List<BreveCoordDTO> dtos = breves.stream()
                .map(BreveCoordDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/filtered")
    public ResponseEntity<Page<BreveEntity>> getAllBreves(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String intervenant,
            @RequestParam(required = false) String contributeur,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String date) {

        Page<BreveEntity> breves = breveServices.getAllBrevesByPage(page, size, zone, categorie, intervenant, contributeur, startDate, endDate, date);
        return ResponseEntity.ok(breves);
    }

    @GetMapping("/export")
    public ResponseEntity<List<BreveEntity>> exportAllFilteredBreves(
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String categorie,
            @RequestParam(required = false) String intervenant,
            @RequestParam(required = false) String contributeur,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String date
    ) {
        List<BreveEntity> breves = breveServices.getAllFilteredBreves(zone, categorie, intervenant, contributeur, startDate, endDate, date);
        return ResponseEntity.ok(breves);
    }

    @GetMapping("/sorted")
    public ResponseEntity<Page<BreveEntity>> getAllBrevesSortedByDate(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(breveServices.getAllBrevesSortedByDate(page, size));
    }

    @PostMapping("/upload")
    public String uploadBreves(@RequestParam("file") MultipartFile file) {
        try {
            List<Map<String, String>> extractedDataList = wordDocumentService.processDocument(file);
            breveServices.saveBrevesFromDocument(extractedDataList);
            return "Breves récupérés avec Succés!";
        } catch (Exception e) {
            return "Error uploading breves: " + e.getMessage();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<BreveEntity> createBreve(@RequestBody BreveEntity breve) {
        try {
            BreveEntity createdBreve = breveServices.saveBreve(breve);
            return new ResponseEntity<>(createdBreve, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<BreveEntity> updateBreve(@RequestParam int id, @RequestBody Map<String, Object> updates) {
        System.out.println("Requête PATCH reçue : " + updates);

        try {
            BreveEntity updatedBreve = breveServices.updateBreve(id, updates);
            return new ResponseEntity<>(updatedBreve, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteBreve(@RequestParam int id) {
        breveServices.deleteBreve(id);
        return new ResponseEntity<>("Breve deleted successfully", HttpStatus.OK);
    }
}
