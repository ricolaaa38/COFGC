package com.comnord.bqsm.model.dto;

import com.comnord.bqsm.model.PictureEntity;
import lombok.Data;

@Data
public class PictureDTO {

    private int id;
    private String name;
    private String base64;

    public PictureDTO(PictureEntity entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.base64 = java.util.Base64.getEncoder().encodeToString(entity.getImage());
    };
}
