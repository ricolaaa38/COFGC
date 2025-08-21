package com.comnord.bqsm.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class ConnectionStatsDTO {
    public List<Map.Entry<LocalDate, Integer>> perDay;
    public List<Map.Entry<String, Integer>> perWeek;
    public List<Map.Entry<String, Integer>> perMonth;
    public List<Map.Entry<Integer, Integer>> perYear;
}
