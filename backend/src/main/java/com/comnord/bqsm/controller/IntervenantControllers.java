package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.IntervenantEntity;
import com.comnord.bqsm.repository.IntervenantRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.IntervenantServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/intervenants")
public class IntervenantControllers {

    @Autowired
    private IntervenantServices intervenantService;

    @Autowired
    private IntervenantRepository intervenantRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<IntervenantEntity>> getIntervenantByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<IntervenantEntity> intervenants = intervenantService.getAllIntervenantsByBreveId(breve);
        return ResponseEntity.ok(intervenants);
    }

    @PostMapping("/create")
    public ResponseEntity<IntervenantEntity> createintervenant(@RequestParam int id, @RequestParam String name) {
        BreveEntity breve = breveServices.getBreveById(id);
        IntervenantEntity intervenant = new IntervenantEntity();
        intervenant.setBreveId(breve);
        intervenant.setName(name);
        IntervenantEntity addIntervenant = intervenantService.saveIntervenant(intervenant);
        return ResponseEntity.status(HttpStatus.CREATED).body(addIntervenant);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateIntervenant(@RequestBody IntervenantEntity intervenant) {
        Optional<IntervenantEntity> existingIntervenant = intervenantRepository.findById(intervenant.getId());
        if (existingIntervenant.isPresent()) {
            IntervenantEntity updatedIntervenant = intervenantService.updateIntervenant(intervenant, existingIntervenant.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedIntervenant);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Intervenant not found avec l'id: " + intervenant.getId());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteIntervenant(@RequestParam int id) {
        intervenantService.deleteIntervenantById(id);
        return new ResponseEntity<>("Intervenant deleted successfully", HttpStatus.OK);
    }

}
