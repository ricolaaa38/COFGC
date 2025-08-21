package com.comnord.bqsm.config;

import com.comnord.bqsm.model.FiltreEntity;
import com.comnord.bqsm.repository.FiltreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class FiltreDataInitializer {

    @Autowired
    private FiltreRepository filtreRepository;

    @PostConstruct
    public void initFiltres() {
        if (filtreRepository.count() == 0) {
            filtreRepository.save(new FiltreEntity("zone", "ZM_Manche"));
            filtreRepository.save(new FiltreEntity("categorie", "Peche"));
            filtreRepository.save(new FiltreEntity("intervenant", "marine_nationale"));
            filtreRepository.save(new FiltreEntity("contributeur", "marine_nationale"));
        }
    }
}
