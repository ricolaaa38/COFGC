package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.FichiersArborescenceNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.model.FichierArborescenceEntity;
import com.comnord.bqsm.repository.FichierArborescenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FichierArborescenceServices {

    @Autowired
    private FichierArborescenceRepository fichierArborescenceRepository;

    public Iterable<FichierArborescenceEntity> getAllFiles() {
        Iterable<FichierArborescenceEntity> fichiers = fichierArborescenceRepository.findAll();
        if (!fichiers.iterator().hasNext()) {
            throw new FichiersArborescenceNotFoundException("No files found in the database.");
        }
        return fichiers;
    }

    public List<FichierArborescenceEntity> getAllFilesByParentId(DossierArborescenceEntity parentId) {
        try {
            List<FichierArborescenceEntity> fichiers = fichierArborescenceRepository.findFilesByParentId(parentId);
            return fichiers != null ? fichiers : List.of();
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve files", e);
        }
    }

    public FichierArborescenceEntity saveFile(FichierArborescenceEntity fichier) {
        try {
            return fichierArborescenceRepository.save(fichier);
        } catch (Exception e) {
            throw new ServiceException("Failed to save file", e);
        }
    }

    public FichierArborescenceEntity updateFile(FichierArborescenceEntity fichier, FichierArborescenceEntity existingFichier) {
        try {
            boolean isModified = false;
            if (!fichier.getName().isEmpty() && !fichier.getName().equals(existingFichier.getName())) {
                existingFichier.setName(fichier.getName());
                isModified = true;
            }
            if (fichier.getParentId() != null && !fichier.getParentId().equals(existingFichier.getParentId())) {
                existingFichier.setParentId(fichier.getParentId());
                isModified = true;
            }
            if (isModified) {
                return fichierArborescenceRepository.save(existingFichier);
            } else {
                throw new ServiceException("No changes detected for file with ID: " + fichier.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update file", e);
        }
    }

    public void deleteFileById(int id) {
        try {
            fichierArborescenceRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete file with id: " + id);
        }
    }
}
