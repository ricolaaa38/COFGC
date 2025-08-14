package com.comnord.bqsm.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "images")
@Data
public class PictureEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_image")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_breve", nullable = false)
    private BreveEntity breveId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image", nullable = false)
    private byte[] image;

}
