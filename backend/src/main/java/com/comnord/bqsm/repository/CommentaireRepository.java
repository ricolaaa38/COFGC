package com.comnord.bqsm.repository;

import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.CommentaireEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends CrudRepository<CommentaireEntity, Integer> {
    List<CommentaireEntity> findAllCommentairesByBreveId(BreveEntity breveId);
}
