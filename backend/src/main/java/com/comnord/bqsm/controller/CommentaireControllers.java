package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.CommentaireEntity;
import com.comnord.bqsm.repository.CommentaireRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.CommentaireServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/commentaires")
public class CommentaireControllers {

    @Autowired
    private CommentaireServices commentaireService;

    @Autowired
    private CommentaireRepository commentaireRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<CommentaireEntity>> getCommentairesByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<CommentaireEntity> commentaires = commentaireService.getAllCommentairesByBreveId(breve);
        return ResponseEntity.ok(commentaires);
    }



    @PostMapping("/create")
    public ResponseEntity<CommentaireEntity> createCommentaire(@RequestBody CommentaireEntity commentaire) {
        CommentaireEntity addCommentaire = commentaireService.saveCommentaire(commentaire);
        return ResponseEntity.status(HttpStatus.CREATED).body(addCommentaire);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateCommentaire(@RequestBody CommentaireEntity commentaire) {
        Optional<CommentaireEntity> existingCommentaire = commentaireRepository.findById(commentaire.getId());
        if (existingCommentaire.isPresent()) {
            CommentaireEntity updatedCommentaire = commentaireService.updateCommentaire(commentaire, existingCommentaire.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedCommentaire);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Commentaire not found");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteCommentaire(@RequestParam int id) {
        commentaireService.deleteCommentaireById(id);
        return new ResponseEntity<>("Commentaire deleted successfully", HttpStatus.OK);
    }

}
