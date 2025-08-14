package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.FiltreEntity;
import com.comnord.bqsm.repository.FiltreRepository;
import com.comnord.bqsm.service.FiltreServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/filtres")
public class FiltreControllers {

    @Autowired
    private FiltreServices filtreServices;

    @Autowired
    private FiltreRepository filtreRepository;

    @GetMapping("/")
    public ResponseEntity<Iterable<FiltreEntity>> getAllFiltres() {
        return ResponseEntity.ok(filtreServices.getAllFiltres());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFiltre(@RequestBody FiltreEntity filtre) {
        Optional<FiltreEntity> alreadyExistEntry = filtreRepository.findFiltreByNameAndCategorie(filtre.getName(), filtre.getCategorie());
        if (alreadyExistEntry.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Le filtre '" + filtre.getName() + "' dans la catégorie '" + filtre.getCategorie() + "' existe déjà.");
        } else {
            FiltreEntity addFiltre = filtreServices.saveFiltre(filtre);
            return ResponseEntity.status(HttpStatus.CREATED).body(addFiltre);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateFiltre(@RequestBody FiltreEntity filtre) {
            Optional<FiltreEntity> existingFiltre = filtreRepository.findById(filtre.getId());
            Optional<FiltreEntity> alreadyExistEntry = filtreRepository.findFiltreByNameAndCategorie(filtre.getName(), filtre.getCategorie());
            if (alreadyExistEntry.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Le filtre '" + filtre.getName() + "' dans la catégorie '" + filtre.getCategorie() + "' existe déjà.");
            }
            if (existingFiltre.isPresent()) {
                FiltreEntity updatedFiltre = filtreServices.updateFiltre(filtre, existingFiltre.get());
                return ResponseEntity.status(HttpStatus.OK).body(updatedFiltre);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Filtre non trouvé avec l'ID: " + filtre.getId());
            }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFiltre(@RequestParam int id) {
        filtreServices.deleteFiltreById(id);
        return new ResponseEntity<>("Filtre supprimé avec succès", HttpStatus.OK);
    }

}
