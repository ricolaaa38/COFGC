package com.comnord.bqsm.controller;

import com.comnord.bqsm.exception.DossierArborescenceNotFoundException;
import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.model.FichierArborescenceEntity;
import com.comnord.bqsm.model.dto.DossierDTO;
import com.comnord.bqsm.model.dto.FichierDTO;
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
    public ResponseEntity<?> updateFolder(
            @RequestParam Integer id,
            @RequestParam(required = false) Integer parentId,
            @RequestParam(required = false) String name
    ) {
        Optional<DossierArborescenceEntity> existingFolderOpt = dossierArborescenceRepository.findById(id);
        if (existingFolderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Dossier non trouvé avec l'ID: " + id);
        }
        DossierArborescenceEntity existingFolder = existingFolderOpt.get();

        DossierArborescenceEntity parent = null;
        if (parentId != null) {
            parent = dossierArborescenceRepository.findById(parentId).orElse(null);
            if (parent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Parent introuvable avec l'ID: " + parentId);
            }
        }
        String newName = name != null ? name : existingFolder.getName();

        Optional<DossierArborescenceEntity> alreadyExistEntry =
                dossierArborescenceRepository.findDossierByParentIdAndName(parent, newName);
        if (alreadyExistEntry.isPresent() && alreadyExistEntry.get().getId() != id) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Le dossier '" + newName + "' existe déjà à cet endroit.");
        }

        DossierArborescenceEntity newFolder = new DossierArborescenceEntity();
        newFolder.setId(id);
        newFolder.setName(newName);
        newFolder.setParentId(parent);

        try {
            DossierArborescenceEntity updatedFolder = dossierArborescenceServices.updateDossier(newFolder, existingFolder);
            return ResponseEntity.status(HttpStatus.OK).body(updatedFolder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour : " + e.getMessage());
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

    // Java
    @PostMapping("/update-file")
    public ResponseEntity<?> updateFile(
            @RequestParam Integer id,
            @RequestParam(required = false) Integer parentId,
            @RequestParam(required = false) String name
    ) {
        Optional<FichierArborescenceEntity> existingFileOpt = fichierArborescenceRepository.findById(id);
        if (existingFileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Fichier non trouvé avec l'ID: " + id);
        }
        FichierArborescenceEntity existingFile = existingFileOpt.get();

        DossierArborescenceEntity parent = null;
        if (parentId != null) {
            parent = dossierArborescenceRepository.findById(parentId).orElse(null);
            if (parent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Parent introuvable avec l'ID: " + parentId);
            }
        }
        String newName = name != null ? name : existingFile.getName();

        Optional<FichierArborescenceEntity> alreadyExistEntry =
                fichierArborescenceRepository.findFileByparentIdAndName(parent, name);
        if (alreadyExistEntry.isPresent() && alreadyExistEntry.get().getId() != id) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Il existe déjà un fichier nommé '" + name + "' dans le dossier.");
        }

        FichierArborescenceEntity newFile = new FichierArborescenceEntity();
        newFile.setId(id);
        newFile.setName(name);
        newFile.setParentId(parent);

        try {
            FichierArborescenceEntity updatedFichier = fichierArborescenceServices.updateFile(newFile, existingFile);
            return ResponseEntity.status(HttpStatus.OK).body(updatedFichier);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la mise à jour : " + e.getMessage());
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
