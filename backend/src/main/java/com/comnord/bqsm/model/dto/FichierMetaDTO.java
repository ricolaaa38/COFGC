package com.comnord.bqsm.model.dto;

import lombok.Data;

@Data
public class FichierMetaDTO {

    private int id;
    private Integer parentId;
    private String name;

    public FichierMetaDTO(int id, Integer parentId, String name) {
        this.id = id;
        this.parentId = parentId;
        this.name = name;
    }
}
