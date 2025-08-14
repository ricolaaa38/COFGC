package com.comnord.bqsm.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "filtres")
@Data
public class FiltreEntity {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_filtre")
    private int id;

    @Column(name = "categorie", nullable = false)
    private String categorie;

    @Column(name = "name", nullable = false)
    private String name;

    public FiltreEntity() {
        // Default constructor for JPA
    }

    public FiltreEntity(String categorie, String name) {
        this.categorie = categorie;
        this.name = name;
    }
}
