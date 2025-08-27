package com.comnord.bqsm.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "zonesmaritime_points")
@Data
public class ZoneMaritimePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "ordre", nullable = false)
    private int ordre;

    @Column(name = "latitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6, nullable = false)
    private BigDecimal longitude;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "id_zonemaritime", nullable = false)
    private ZoneMaritime zoneId;
}
