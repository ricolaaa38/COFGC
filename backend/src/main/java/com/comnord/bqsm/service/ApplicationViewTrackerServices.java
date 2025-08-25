package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.ApplicationViewTrackerNotFound;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.ApplicationViewTrackerEntity;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.BreveViewTrackerEntity;
import com.comnord.bqsm.model.dto.ConnectionStatsDTO;
import com.comnord.bqsm.repository.ApplicationViewTrackerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationViewTrackerServices {

    @Autowired
    private ApplicationViewTrackerRepository applicationViewTrackerRepository;

    public Iterable<ApplicationViewTrackerEntity> getAllApplicationViewTrackers() {
        return applicationViewTrackerRepository.findAll();
    }

    public List<ApplicationViewTrackerEntity> getApplicationViewTrackerByDayOfWeek(int dayOfWeek) {
        try {
            return applicationViewTrackerRepository.findApplicationViewTrackerByDayOfWeek(dayOfWeek);
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

    public List<Map.Entry<LocalDate, Integer>> getTotalConnectionPerDays() {
        Iterable<ApplicationViewTrackerEntity> entries = applicationViewTrackerRepository.findAll();
        Map<LocalDate, Integer> connectionPerDay = new HashMap<>();

        for (ApplicationViewTrackerEntity entry : entries) {
            LocalDate date = entry.getDate().toLocalDate();
            connectionPerDay.put(date, connectionPerDay.getOrDefault(date, 0) + entry.getConnectionCount());
        }
        return new ArrayList<>(connectionPerDay.entrySet());
    }

    public ConnectionStatsDTO getConnectionStats() {
        Iterable<ApplicationViewTrackerEntity> entries = applicationViewTrackerRepository.findAll();

        Map<LocalDate, Integer> perDay = new HashMap<>();
        Map<String, Integer> perWeek = new HashMap<>();
        Map<String, Integer> perMonth = new HashMap<>();
        Map<Integer, Integer> perYear = new HashMap<>();

        for (ApplicationViewTrackerEntity entry : entries) {
            LocalDate date = entry.getDate().toLocalDate();
            int week = date.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            String month = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            int year = date.getYear();
            String weekKey = year + "-W" + String.format("%02d", week);

            perDay.put(date, perDay.getOrDefault(date, 0) + entry.getConnectionCount());
            perWeek.put(weekKey, perWeek.getOrDefault(weekKey, 0) + entry.getConnectionCount());
            perMonth.put(month, perMonth.getOrDefault(month, 0) + entry.getConnectionCount());
            perYear.put(year, perYear.getOrDefault(year, 0) + entry.getConnectionCount());
        }

        ConnectionStatsDTO dto = new ConnectionStatsDTO();
        dto.perDay = new ArrayList<>(perDay.entrySet());
        dto.perWeek = new ArrayList<>(perWeek.entrySet());
        dto.perMonth = new ArrayList<>(perMonth.entrySet());
        dto.perYear = new ArrayList<>(perYear.entrySet());
        return dto;
    }

    public Map<String, Integer> getTotalConnectionPerDayOfWeekAndYear() {
        Iterable<ApplicationViewTrackerEntity> entries = applicationViewTrackerRepository.findAll();
        Map<String, Integer> result = new HashMap<>();
        for (ApplicationViewTrackerEntity entry : entries) {
            LocalDate date = entry.getDate().toLocalDate();
            int year = date.getYear();
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1 = lundi, 7 = dimanche
            String key = year + "-" + dayOfWeek;
            result.put(key, result.getOrDefault(key, 0) + entry.getConnectionCount());
        }
        return result;
    }

    public void insertFakeApplicationViewTracker(String userEmail, LocalDateTime date, int connectionCount) {
        ApplicationViewTrackerEntity entity = new ApplicationViewTrackerEntity();
        entity.setUserEmail(userEmail);
        entity.setDate(date);
        entity.setConnectionCount(connectionCount);
        applicationViewTrackerRepository.save(entity);
    }
}
