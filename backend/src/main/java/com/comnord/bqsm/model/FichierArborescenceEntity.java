package com.comnord.bqsm.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "fichiers")
@Data
public class FichierArborescenceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fichier")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_parent")
    private DossierArborescenceEntity parentId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "fichier")
    private byte[] file;

}
