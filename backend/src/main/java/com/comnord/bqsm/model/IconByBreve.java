package com.comnord.bqsm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "iconbybreve")
@Data
public class IconByBreve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_icon_by_breve")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_intervenant", nullable = true)
    private IntervenantEntity intervenantId;

    @ManyToOne
    @JoinColumn(name = "id_contributeur", nullable = true)
    private ContributeurEntity contributeurId;

    @ManyToOne
    @JoinColumn(name = "id_breve", nullable = false)
    private BreveEntity breveId;

    @ManyToOne
    @JoinColumn(name = "id_icon", nullable = false)
    private IconEntity iconId;
}
