package com.comnord.bqsm.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "links")
@Data
public class LinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_link")
    private int id;

    @ManyToOne
    @JoinColumn(name = "id_breve", nullable = false)
    private BreveEntity breveId;

    @Column(name="name", nullable = false)
    private String name;

    @Column(name = "link", nullable = false)
    private String link;

    @Column(name = "type_lien", nullable = false)
    private String typeLink;
}
