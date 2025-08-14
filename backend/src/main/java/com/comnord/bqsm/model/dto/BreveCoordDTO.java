package com.comnord.bqsm.model.dto;

import com.comnord.bqsm.model.BreveEntity;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BreveCoordDTO {
    private int id;
    private String titre;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public BreveCoordDTO(BreveEntity entity) {
        this.id = entity.getId();
        this.titre = entity.getTitre();
        this.latitude = entity.getLatitude();
        this.longitude = entity.getLongitude();
    }

    
}
