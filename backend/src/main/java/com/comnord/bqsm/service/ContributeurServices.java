package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.ContributeursNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.ContributeurEntity;
import com.comnord.bqsm.repository.ContributeurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContributeurServices {

    @Autowired
    private ContributeurRepository contributeurRepository;

    @Autowired
    private BreveServices breveServices;

    public ContributeurEntity getContributeurById(int id) {
        try {
            return contributeurRepository.findById(id)
                    .orElseThrow(() -> new ContributeursNotFoundException("Contributeur not found with id: " + id));
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve contributeur with id: " + id, e);
        }
    }

    public List<ContributeurEntity> getAllContributeursByBreveId(BreveEntity breveId) {
         try {
             List<ContributeurEntity> contributeurs = contributeurRepository.findAllContributeursByBreveId(breveId);
             return contributeurs ;
         } catch (ContributeursNotFoundException e) {
             return null;
         } catch (Exception e) {
             throw new ServiceException("Failed to retrieve contributeurs", e);
         }
    }

    public ContributeurEntity saveContributeur(ContributeurEntity contributeur) {
        try {
            return contributeurRepository.save(contributeur);
        } catch (Exception e) {
            throw new ServiceException("Failed to save contributeur", e);
        }
    }

    public ContributeurEntity updateContributeur(ContributeurEntity contributeur, ContributeurEntity existingContributeur) {
        try {
            boolean isModified = false;
            if (!contributeur.getName().isEmpty() && !contributeur.getName().equals(existingContributeur.getName())) {
                existingContributeur.setName(contributeur.getName());
                isModified = true;
            }
            if (isModified) {
                return contributeurRepository.save(existingContributeur);
            } else {
                throw new ServiceException("No changes detected for contributeur with ID: " + contributeur.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update contributeur", e);
        }
    }

    public void deleteContributeurById(int id) {
        try {
            ContributeurEntity contributeur = contributeurRepository.findById(id).orElseThrow(() -> new ContributeursNotFoundException("Contributeur not found with id: " + id));
            contributeurRepository.delete(contributeur);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete contributeur with ID: " + id, e);
        }
    }
}
