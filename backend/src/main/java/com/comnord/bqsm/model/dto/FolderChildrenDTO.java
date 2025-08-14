package com.comnord.bqsm.model.dto;

import com.comnord.bqsm.model.DossierArborescenceEntity;
import com.comnord.bqsm.model.FichierArborescenceEntity;
import lombok.Data;

import java.util.List;

@Data
public class FolderChildrenDTO {

    private List<DossierArborescenceEntity> folders;
    private List<FichierArborescenceEntity> files;
}
