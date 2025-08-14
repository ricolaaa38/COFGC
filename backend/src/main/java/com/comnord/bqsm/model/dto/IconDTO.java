package com.comnord.bqsm.model.dto;

import lombok.Data;

@Data
public class IconDTO {

    private int id;
    private String iconName;
    private String base64;

    public IconDTO(int id, String iconName, byte[] icon) {
        this.id = id;
        this.iconName = iconName;
        this.base64 = java.util.Base64.getEncoder().encodeToString(icon);
    }
}
