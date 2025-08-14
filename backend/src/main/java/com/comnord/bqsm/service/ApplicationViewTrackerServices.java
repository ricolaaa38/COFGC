package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.ApplicationViewTrackerNotFound;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.ApplicationViewTrackerEntity;
import com.comnord.bqsm.repository.ApplicationViewTrackerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationViewTrackerServices {

    @Autowired
    private ApplicationViewTrackerRepository applicationViewTrackerRepository;

    public Iterable<ApplicationViewTrackerEntity> getAllApplicationViewTrackers() {
        Iterable<ApplicationViewTrackerEntity> applicationViewTracker = applicationViewTrackerRepository.findAll();
        if (!applicationViewTracker.iterator().hasNext()) {
            throw new ApplicationViewTrackerNotFound("No application view trackers were found in the database.");
        }
        return applicationViewTracker;
    }

    public List<ApplicationViewTrackerEntity> getApplicationViewTrackerByDayOfWeek(int dayOfWeek) {
        try {
            List<ApplicationViewTrackerEntity> applicationViewTracker = applicationViewTrackerRepository.findApplicationViewTrackerByDayOfWeek(dayOfWeek);
            if (applicationViewTracker.isEmpty()) {
                throw new ApplicationViewTrackerNotFound("Aucune donnée trouvé pour le jour : " + dayOfWeek);
            }
            return applicationViewTracker;
        } catch (ApplicationViewTrackerNotFound e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Erreur lors de la récuperation des données" +dayOfWeek, e);
        }
    }

    public ApplicationViewTrackerEntity saveApplicationViewTracker(ApplicationViewTrackerEntity applicationViewTracker) {
        try {
            applicationViewTracker.setDate(LocalDateTime.now());
            return applicationViewTrackerRepository.save(applicationViewTracker);
        } catch (Exception e) {
            throw new ServiceException("Failed to save ApplicationViewTracker", e);
        }
    }
}
