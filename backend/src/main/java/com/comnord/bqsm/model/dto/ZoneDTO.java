package com.comnord.bqsm.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class ZoneDTO {
    private String name;
    private String color;
    private String description;
    private List<PointDTO> points;

    @Data
    public static class PointDTO {
        private double latitude;
        private double longitude;
        private int ordre;
    }
}
