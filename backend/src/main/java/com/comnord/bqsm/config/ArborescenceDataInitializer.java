package com.comnord.bqsm.config;

import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.repository.DossierArborescenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class ArborescenceDataInitializer {

    @Autowired
    private DossierArborescenceRepository dossierRepository;

    @PostConstruct
    public void initDossiers() {
        if (dossierRepository.count() == 0) {
            DossierArborescenceEntity dossier = new DossierArborescenceEntity();
            dossier.setName("dossier");
            dossier.setParentId(null);
            dossierRepository.save(dossier);
        }
    }
}