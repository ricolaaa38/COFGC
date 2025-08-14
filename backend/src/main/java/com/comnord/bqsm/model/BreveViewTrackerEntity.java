package com.comnord.bqsm.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "breves_view_tracker")
@Data
public class BreveViewTrackerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_view_tracker")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_breve", nullable = false)
    private BreveEntity breveId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name= "date", nullable = false)
    private LocalDateTime date;

}
