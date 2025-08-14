package com.comnord.bqsm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "icon")
@Data
public class IconEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_icon")
    private int id;

    @Column(name = "icon_name", nullable = false)
    private String iconName;

    @Column(name = "icon", nullable = false)
    private byte[] icon;

    @JsonIgnore
    @OneToMany(mappedBy = "iconId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IconByBreve> iconsByBreve;

}
