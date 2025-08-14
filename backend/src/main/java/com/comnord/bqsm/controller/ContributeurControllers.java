package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.ContributeurEntity;
import com.comnord.bqsm.repository.ContributeurRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.ContributeurServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/contributeurs")
public class ContributeurControllers {

    @Autowired
    private ContributeurServices contributeurService;

    @Autowired
    private ContributeurRepository contributeurRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<ContributeurEntity>> getContributeursByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<ContributeurEntity> contributeurs = contributeurService.getAllContributeursByBreveId(breve);
        return ResponseEntity.ok(contributeurs);
    }

    @PostMapping("/create")
    public ResponseEntity<ContributeurEntity> createContributeur(@RequestParam int id, @RequestParam String name) {
        BreveEntity breve = breveServices.getBreveById(id);
        ContributeurEntity contributeur = new ContributeurEntity();
        contributeur.setBreveId(breve);
        contributeur.setName(name);
        ContributeurEntity addContributeur = contributeurService.saveContributeur(contributeur);
        return ResponseEntity.status(HttpStatus.CREATED).body(addContributeur);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateContributeur(@RequestBody ContributeurEntity contributeur) {
        Optional<ContributeurEntity> existingContributeur = contributeurRepository.findById(contributeur.getId());
        if (existingContributeur.isPresent()) {
            ContributeurEntity updatedContributeur = contributeurService.updateContributeur(contributeur, existingContributeur.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedContributeur);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contributeur not found avec l'id: " + contributeur.getId());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteContributeur(@RequestParam int id) {
        contributeurService.deleteContributeurById(id);
        return new ResponseEntity<>("Contributeur deleted successfully", HttpStatus.OK);
    }

}
