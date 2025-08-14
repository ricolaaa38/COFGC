package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.LinkEntity;
import com.comnord.bqsm.repository.LinkRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.LinkServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/links")
public class LinkControllers {

    @Autowired
    private LinkServices linkServices;

    @Autowired
    private LinkRepository linkRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<LinkEntity>> getAllLinksByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<LinkEntity> links = linkServices.getLinksByBreveId(breve);
        return ResponseEntity.ok(links);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createLink(@RequestBody LinkEntity link) {
        Optional<LinkEntity> linkAlreadyExists = linkRepository.findLinkByBreveIdAndLink(link.getBreveId(), link.getLink());
        Optional<LinkEntity> nameAlreadyExists = linkRepository.findLinkByBreveIdAndName(link.getBreveId(), link.getName());
        if (linkAlreadyExists.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le lien '" + link.getLink() + "' existe déjà pour cette brève.");
        }
        if (nameAlreadyExists.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le nom de lien '" + link.getName() + "' existe déjà pour cette breve.");
        }
        LinkEntity addLink = linkServices.saveLink(link);
        return ResponseEntity.status(HttpStatus.CREATED).body(addLink);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateLink(@RequestBody LinkEntity link) {
        Optional<LinkEntity> existingLink = linkRepository.findById(link.getId());
        Optional<LinkEntity> linkAlreadyExists = linkRepository.findLinkByBreveIdAndLink(link.getBreveId(), link.getLink());
        Optional<LinkEntity> nameAlreadyExists = linkRepository.findLinkByBreveIdAndName(link.getBreveId(), link.getName());

        if (linkAlreadyExists.isPresent() && linkAlreadyExists.get().getId() != link.getId()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le lien '" + link.getLink() + "' existe déjà pour cette brève.");
        }

        if (nameAlreadyExists.isPresent() && nameAlreadyExists.get().getId() != link.getId()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le nom de lien '" + link.getName() + "' existe déjà pour cette breve.");
        }

        if (existingLink.isPresent()) {
            LinkEntity updatedLink = linkServices.updateLink(link, existingLink.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedLink);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Lien non trouvé avec l'ID: " + link.getId());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteLink(@RequestParam int id) {
        linkServices.deleteLinkById(id);
        return new ResponseEntity<>("Link deleted successfully", HttpStatus.OK);
    }


}
