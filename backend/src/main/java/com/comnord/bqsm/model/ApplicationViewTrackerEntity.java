package com.comnord.bqsm.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "application_view_tracker")
@Data
public class ApplicationViewTrackerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_view_tracker")
    private int id;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "connection_count", nullable = false)
    private int connectionCount = 1;
}
