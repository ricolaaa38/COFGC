package com.comnord.bqsm.service;

import com.comnord.bqsm.model.ZoneMaritime;
import com.comnord.bqsm.model.ZoneMaritimePoint;
import com.comnord.bqsm.model.dto.ZoneDTO;
import com.comnord.bqsm.repository.ZoneMaritimeRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ZoneMaritimeService {

    @Autowired
    private ZoneMaritimeRepository zoneMaritimeRepository;

    @Transactional
    public ZoneMaritime createZoneMaritime(ZoneDTO zoneDto) {
        ZoneMaritime zoneMaritime = new ZoneMaritime();
        zoneMaritime.setName(zoneDto.getName());
        zoneMaritime.setColor(zoneDto.getColor());
        zoneMaritime.setDescription(zoneDto.getDescription());
        var points = zoneDto.getPoints().stream().map(pointDto -> {
            ZoneMaritimePoint point = new ZoneMaritimePoint();
            point.setLatitude(BigDecimal.valueOf(pointDto.getLatitude()));
            point.setLongitude(BigDecimal.valueOf(pointDto.getLongitude()));
            point.setOrdre(pointDto.getOrdre());
            point.setZoneId(zoneMaritime);
            return point;
        }).toList();
        zoneMaritime.setPoints(points);
        return zoneMaritimeRepository.save(zoneMaritime);
    }

    public List<ZoneMaritime> getAllZonesMaritimes() {
        return (List<ZoneMaritime>) zoneMaritimeRepository.findAll();
    }

    public void deleteZoneMaritime(int id) {
        zoneMaritimeRepository.deleteById(id);
    }
}
