package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.FiltresNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.FiltreEntity;
import com.comnord.bqsm.repository.FiltreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FiltreServices {

    @Autowired
    private FiltreRepository filtreRepository;

    public Iterable<FiltreEntity> getAllFiltres() {
        Iterable<FiltreEntity> filtres = filtreRepository.findAll();
        if (!filtres.iterator().hasNext()) {
            throw new FiltresNotFoundException("No filters were found in the database.");
        }
        return filtres;
    }

    public FiltreEntity updateFiltre(FiltreEntity filtre, FiltreEntity existingFiltre) {
        try {
            boolean isModified = false;
            if (!filtre.getName().isEmpty() && !filtre.getName().equals(existingFiltre.getName())) {
                existingFiltre.setName(filtre.getName());
                isModified = true;
            }
            if (!filtre.getCategorie().isEmpty() && !filtre.getCategorie().equals(existingFiltre.getCategorie())) {
                existingFiltre.setCategorie(filtre.getCategorie());
                isModified = true;
            }
            if (isModified) {
                return filtreRepository.save(existingFiltre);
            } else {
                throw new ServiceException("No changes detected for filter with ID: " + filtre.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update filter", e);
        }
    }

    public FiltreEntity saveFiltre(FiltreEntity filtre) {
        try {
            return filtreRepository.save(filtre);
        } catch (Exception e) {
            throw new ServiceException("Failed to save filter", e);
        }
    }

    public void deleteFiltreById(int id) {
        try {
            filtreRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete filter with ID: " + id, e);
        }
    }
}
