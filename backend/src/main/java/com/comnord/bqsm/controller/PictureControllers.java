package com.comnord.bqsm.controller;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.PictureEntity;
import com.comnord.bqsm.model.dto.PictureDTO;
import com.comnord.bqsm.repository.PictureRepository;
import com.comnord.bqsm.service.BreveServices;
import com.comnord.bqsm.service.PictureServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pictures")
public class PictureControllers {

    @Autowired
    private PictureServices pictureServices;

    @Autowired
    private PictureRepository pictureRepository;

    @Autowired
    private BreveServices breveServices;

    @GetMapping("/")
    public ResponseEntity<List<PictureDTO>> getPictureByBreveId(@RequestParam int breveId) {
        BreveEntity breve = breveServices.getBreveById(breveId);
        List<PictureEntity> pictures = pictureServices.getAllPictureByBreveId(breve);
        List<PictureDTO> dtos = pictures.stream().map(PictureDTO::new).toList();
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPicture(@RequestParam String name, @RequestParam int breveId, @RequestParam MultipartFile imageFile) {
        try {
            BreveEntity breveEntity = breveServices.getBreveById(breveId);
            if (breveEntity == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Brève avec l'ID " + breveId + " non trouvée.");
            }

            Optional<PictureEntity> alreadyExistEntry = pictureRepository.findPictureByBreveIdAndName(breveEntity, name);
            if (alreadyExistEntry.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Le nom de photo '" + name + "' existe déjà pour cette brève.");
            }
            PictureEntity picture = new PictureEntity();
            picture.setName(name);
            picture.setBreveId(breveEntity);
            picture.setImage(imageFile.getBytes());
            PictureEntity addPicture = pictureServices.savePicture(picture);
            return ResponseEntity.status(HttpStatus.CREATED).body(addPicture);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deletePicture(@RequestParam int id) {
        pictureServices.deletePictureById(id);
        return new ResponseEntity<>("Picture deleted successfully", HttpStatus.OK);
    }
}
