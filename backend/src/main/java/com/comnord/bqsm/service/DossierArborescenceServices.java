package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.DossierArborescenceNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.repository.DossierArborescenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DossierArborescenceServices {

    @Autowired
    private DossierArborescenceRepository dossierArborescenceRepository;

    public Iterable<DossierArborescenceEntity> getAllDossiers() {
        Iterable<DossierArborescenceEntity> dossiers = dossierArborescenceRepository.findAll();
        if (!dossiers.iterator().hasNext()) {
            throw new DossierArborescenceNotFoundException("No folders found in the database.");
        }
        return dossiers;
    }

    public List<DossierArborescenceEntity> getAllChildDossiersByParentId(DossierArborescenceEntity parentId) {
        try {
            List<DossierArborescenceEntity> dossiers = dossierArborescenceRepository.findByParentId(parentId);
            return dossiers != null ? dossiers : List.of();
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve child folders", e);
        }
    }

    public DossierArborescenceEntity saveDossier(DossierArborescenceEntity dossier) {
        try {
            return dossierArborescenceRepository.save(dossier);
        } catch (Exception e) {
            throw new ServiceException("Failed to save the folder", e);
        }
    }

    public DossierArborescenceEntity updateDossier(DossierArborescenceEntity dossier, DossierArborescenceEntity existingDossier) {
        try {
            boolean isModified = false;
            if (!dossier.getName().isEmpty() && !dossier.getName().equals(existingDossier.getName())) {
                existingDossier.setName(dossier.getName());
                isModified = true;
            }
            if (dossier.getParentId() != null && !dossier.getParentId().equals(existingDossier.getParentId())) {
                existingDossier.setParentId(dossier.getParentId());
                isModified = true;
            }
            if (isModified) {
                return dossierArborescenceRepository.save(existingDossier);
            } else {
                throw new ServiceException("No changes detected for folder with ID: " + dossier.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update folder", e);
        }
    }

    public void deleteDossierById(int id) {
        try {
            dossierArborescenceRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete folder with id: " + id);
        }
    }
}
