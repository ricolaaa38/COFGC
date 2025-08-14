package com.comnord.bqsm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "dossiers")
@Data
public class DossierArborescenceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dossier")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_parent")
    private DossierArborescenceEntity parentId;

    @Column(name = "name", nullable = false)
    private String name;

    @JsonIgnore
    @OneToMany(mappedBy = "parentId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DossierArborescenceEntity> dossiersEnfant;

    @JsonIgnore
    @OneToMany(mappedBy = "parentId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FichierArborescenceEntity> fichiersEnfant;

    // Java
    public DossierArborescenceEntity() {
        // Constructeur par défaut requis par JPA
    }

    public DossierArborescenceEntity(String name, DossierArborescenceEntity parentId) {
        this.name = name;
        this.parentId = parentId;
    }
}
