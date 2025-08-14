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
            filtreRepository.save(new FiltreEntity("zone", "zm_manche"));
            filtreRepository.save(new FiltreEntity("categorie", "peche"));
            filtreRepository.save(new FiltreEntity("intervenant", "marine"));
            filtreRepository.save(new FiltreEntity("contributeur", "marine"));
        }
    }
}
