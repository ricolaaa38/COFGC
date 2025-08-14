package com.comnord.bqsm.controller;

import com.comnord.bqsm.exception.DossierArborescenceNotFoundException;
import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.model.FichierArborescenceEntity;
import com.comnord.bqsm.model.dto.DossierDTO;
import com.comnord.bqsm.model.dto.FichierMetaDTO;
import com.comnord.bqsm.model.dto.FolderChildrenDTO;
import com.comnord.bqsm.repository.DossierArborescenceRepository;
import com.comnord.bqsm.repository.FichierArborescenceRepository;
import com.comnord.bqsm.service.DossierArborescenceServices;
import com.comnord.bqsm.service.FichierArborescenceServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/arborescence")
public class ArborescenceControllers {

    @Autowired
    private DossierArborescenceServices dossierArborescenceServices;

    @Autowired
    private DossierArborescenceRepository dossierArborescenceRepository;

    @Autowired
    private FichierArborescenceServices fichierArborescenceServices;

    @Autowired
    private FichierArborescenceRepository fichierArborescenceRepository;

    @GetMapping("/dossiers")
    public ResponseEntity<Iterable<DossierArborescenceEntity>> getAllDossiers() {
        return ResponseEntity.ok(dossierArborescenceServices.getAllDossiers());
    }

    @GetMapping("/files")
    public ResponseEntity<Iterable<FichierArborescenceEntity>> getAllFiles() {
        return ResponseEntity.ok(fichierArborescenceServices.getAllFiles());
    }

    // src/main/java/com/comnord/bqsm/controller/ArborescenceControllers.java

    @GetMapping("/files-meta")
    public ResponseEntity<List<FichierMetaDTO>> getAllFilesMeta() {
        List<FichierArborescenceEntity> files = (List<FichierArborescenceEntity>) fichierArborescenceServices.getAllFiles();
        List<FichierMetaDTO> metaList = files.stream()
                .map(f -> new FichierMetaDTO(
                        f.getId(),
                        f.getParentId() != null ? f.getParentId().getId() : null,
                        f.getName()
                ))
                .toList();
        return ResponseEntity.ok(metaList);
    }

    @GetMapping("/get-file/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable int id) {
        Optional<FichierArborescenceEntity> fichierOpt = fichierArborescenceRepository.findById(id);
        if (fichierOpt.isPresent()) {
            FichierArborescenceEntity fichier = fichierOpt.get();
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fichier.getName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(fichier.getFile());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/file-meta/{id}")
    public ResponseEntity<FichierArborescenceEntity> getFileMeta(@PathVariable int id) {
        Optional<FichierArborescenceEntity> fichierOpt = fichierArborescenceRepository.findById(id);
        return fichierOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    // Endpoint pour les métadonnées d'un dossier
    @GetMapping("/folder-meta/{id}")
    public ResponseEntity<DossierArborescenceEntity> getFolderMeta(@PathVariable int id) {
        Optional<DossierArborescenceEntity> dossierOpt = dossierArborescenceRepository.findById(id);
        return dossierOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }


    @GetMapping("/child")
    public ResponseEntity<?> getAllFoldersChildren(@RequestParam int parentId) {
        DossierArborescenceEntity parent = dossierArborescenceRepository.findById(parentId)
                .orElseThrow(() -> new DossierArborescenceNotFoundException("Parent folder not found"));

        List<DossierArborescenceEntity> childFolders = dossierArborescenceServices.getAllChildDossiersByParentId(parent);
        List<FichierArborescenceEntity> childFiles = fichierArborescenceServices.getAllFilesByParentId(parent);

        FolderChildrenDTO folderChildrenDTO = new FolderChildrenDTO();
        folderChildrenDTO.setFolders(childFolders);
        folderChildrenDTO.setFiles(childFiles);
        return ResponseEntity.ok(folderChildrenDTO);
    }

    @PostMapping("/create-folder")
    public ResponseEntity<?> createFolder(@RequestBody DossierDTO dossierDTO) {
        DossierArborescenceEntity newFolder = new DossierArborescenceEntity();
        newFolder.setName(dossierDTO.getName());
        if (dossierDTO.getParentId() != null) {
            Optional<DossierArborescenceEntity> parentOpt = dossierArborescenceRepository.findById(dossierDTO.getParentId());
            if (parentOpt.isPresent()) {
                newFolder.setParentId(parentOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Parent introuvable avec l'ID: " + dossierDTO.getParentId());
            }
        } else {
            newFolder.setParentId(null);
        }
        Optional<DossierArborescenceEntity> alreadyExistFolder =
                dossierArborescenceRepository.findDossierByParentIdAndName(newFolder.getParentId(), newFolder.getName());
        if (alreadyExistFolder.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le dossier '" + newFolder.getName() + "' existe déjà à cet endroit.");
        } else {
            DossierArborescenceEntity addDossier = dossierArborescenceServices.saveDossier(newFolder);
            return ResponseEntity.status(HttpStatus.CREATED).body(addDossier);
        }
    }


    @PostMapping("/update-folder")
    public ResponseEntity<?> updateFolder(@RequestBody DossierArborescenceEntity dossier) {
        Optional<DossierArborescenceEntity> existingFolder = dossierArborescenceRepository.findById(dossier.getId());
        Optional<DossierArborescenceEntity> alreadyExistEntry = dossierArborescenceRepository.findDossierByParentIdAndName(dossier.getParentId(), dossier.getName());
        if (alreadyExistEntry.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Le dossier '" + dossier.getName() + "' existe déjà dans le dossier '" + dossierArborescenceRepository.findById(dossier.getParentId().getId()).get().getName() + "'.");
        }
        if (existingFolder.isPresent()) {
            DossierArborescenceEntity updatedDossier = dossierArborescenceServices.updateDossier(dossier, existingFolder.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedDossier);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dossier non trouvé avec l'ID: " + dossier.getId());
        }
    }

    @PostMapping(value = "/create-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFile(
            @RequestParam(required = false) Integer parentId,
            @RequestParam String name,
            @RequestParam MultipartFile file
    ) {
        try {
            DossierArborescenceEntity parent = null;
            if (parentId != null) {
                Optional<DossierArborescenceEntity> parentOpt = dossierArborescenceRepository.findById(parentId);
                if (parentOpt.isPresent()) {
                    parent = parentOpt.get();
                } else {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Parent introuvable avec l'ID: " + parentId);
                }
            }
            Optional<FichierArborescenceEntity> alreadyExistFile =
                    fichierArborescenceRepository.findFileByparentIdAndName(parent, name);
            if (alreadyExistFile.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Un fichier '" + name + "' existe déjà à cet endroit.");
            }
            FichierArborescenceEntity fichier = new FichierArborescenceEntity();
            fichier.setParentId(parent);
            fichier.setName(name);
            fichier.setFile(file.getBytes());
            FichierArborescenceEntity addFichier = fichierArborescenceServices.saveFile(fichier);
            return ResponseEntity.status(HttpStatus.CREATED).body(addFichier);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue: " + e.getMessage());
        }
    }

    @PostMapping("/update-file")
    public ResponseEntity<?> updateFile(@RequestBody FichierArborescenceEntity fichier) {
        Optional<FichierArborescenceEntity> existingFile = fichierArborescenceRepository.findById(fichier.getId());
        Optional<FichierArborescenceEntity> alreadyExistEntry = fichierArborescenceRepository.findFileByparentIdAndName(fichier.getParentId(), fichier.getName());
        if (alreadyExistEntry.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Il existe déjà un fichier nommé '" + fichier.getName() + "' dans le dossier '" + dossierArborescenceRepository.findById(fichier.getParentId().getId()).get().getName() + "'.");
        }
        if (existingFile.isPresent()) {
            FichierArborescenceEntity updatedFichier = fichierArborescenceServices.updateFile(fichier, existingFile.get());
            return ResponseEntity.status(HttpStatus.OK).body(updatedFichier);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé avec l'ID: " + fichier.getId());
        }
    }

    @DeleteMapping("/delete-folder")
    public ResponseEntity<String> deleteFolder(@RequestParam int id) {
        dossierArborescenceServices.deleteDossierById(id);
        return new ResponseEntity<>("Dossier supprimé avec succès", HttpStatus.OK);
    }

    @DeleteMapping("/delete-file")
    public ResponseEntity<String> deleteFile(@RequestParam int id) {
        fichierArborescenceServices.deleteFileById(id);
        return new ResponseEntity<>("Fichier supprimé avec succès", HttpStatus.OK);
    }

}
