package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.*;
import com.comnord.bqsm.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/icons-by-breve")
public class IconByBreveControllers {

    @Autowired
    private IconByBreveServices iconByBreveServices;

    @Autowired
    private IconServices iconServices;

    @Autowired
    private BreveServices breveServices;

    @Autowired
    private IntervenantServices intervenantServices;

    @Autowired
    private ContributeurServices contributeurServices;

    @GetMapping("/list")
    public ResponseEntity<List<IconByBreve>> getIconsByBreve(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<IconByBreve> icons = iconByBreveServices.getAllIconsByBreveId(breve);
        return ResponseEntity.ok(icons);
    }

    @PostMapping("/create")
    public ResponseEntity<?> addIconByBreve(
            @RequestParam int breveId,
            @RequestParam int iconId,
            @RequestParam(required = false) Integer intervenantId,
            @RequestParam(required = false) Integer contributeurId ) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        IconEntity icon = iconServices.getIconById(iconId);
        IconByBreve iconByBreve = new IconByBreve();
        iconByBreve.setBreveId(breve);
        iconByBreve.setIconId(icon);

        if (intervenantId != null && contributeurId == null) {
            IntervenantEntity intervenant = intervenantServices.getIntervenantById(intervenantId);
            iconByBreve.setIntervenantId(intervenant);
        } else if (contributeurId != null && intervenantId == null) {
            ContributeurEntity contributeur = contributeurServices.getContributeurById(contributeurId);
            iconByBreve.setContributeurId(contributeur);
        } else {
            return ResponseEntity.badRequest().body("Veuillez spécifier soit un intervenant, soit un contributeur, mais pas les deux.");
        }
        IconByBreve savedIconByBreve = iconByBreveServices.saveIconByBreve(iconByBreve);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedIconByBreve);

    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteIconByBreve(@RequestParam int id) {
        iconByBreveServices.deleteIconByBreveById(id);
        return ResponseEntity.ok("Association supprimée avec succès");
    }
}
