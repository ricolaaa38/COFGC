package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.BrevesViewTrackerNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.BreveViewTrackerEntity;
import com.comnord.bqsm.repository.BreveViewTrackerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BreveViewTrackerServices {

    @Autowired
    private BreveViewTrackerRepository breveViewTrackerRepository;

    @Autowired
    private BreveServices breveServices;

    public List<BreveViewTrackerEntity> getBreveViewTrackerByBreveId(BreveEntity breveId) {
        try {
            List<BreveViewTrackerEntity> breveViewTracker = breveViewTrackerRepository.findViewTrackerByBreveId(breveId);
            if (breveViewTracker.isEmpty()) {
                throw new BrevesViewTrackerNotFoundException("Aucun tracker trouvé pour la brève avec l'ID : " + breveId.getId());
            }
            return breveViewTracker;
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve BreveViewTracker", e);
        }
    }

    public BreveViewTrackerEntity saveBreveViewTracker(BreveViewTrackerEntity breveViewTracker) {
        try {
            breveViewTracker.setDate(LocalDateTime.now());
            return breveViewTrackerRepository.save(breveViewTracker);
        } catch (Exception e) {
            throw new ServiceException("Failed to save BreveViewTracker", e);
        }
    }

}
