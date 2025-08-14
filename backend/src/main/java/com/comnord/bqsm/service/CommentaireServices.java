package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.CommentairesNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.CommentaireEntity;
import com.comnord.bqsm.repository.CommentaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CommentaireServices {

    @Autowired
    private CommentaireRepository commentaireRepository;

    @Autowired
    private BreveServices breveServices;

    public List<CommentaireEntity> getAllCommentairesByBreveId(BreveEntity breveId) {
     try {
         List<CommentaireEntity> commentaires = commentaireRepository.findAllCommentairesByBreveId(breveId);
         return commentaires;
     } catch (CommentairesNotFoundException e) {
         throw e;
     } catch (Exception e) {
         throw new ServiceException("Failed to retrieve commentaires", e);
     }
    }

    public CommentaireEntity saveCommentaire(CommentaireEntity commentaire) {
        try {
            return commentaireRepository.save(commentaire);
        } catch (Exception e) {
            throw new ServiceException("Failed to save commentaire", e);
        }
    }

    public CommentaireEntity updateCommentaire(CommentaireEntity commentaire, CommentaireEntity existingCommentaire) {
        try {
            boolean isModified = false;
           if (!commentaire.getCommentaire().isEmpty() && !commentaire.getCommentaire().equals(existingCommentaire.getCommentaire())) {
                existingCommentaire.setCommentaire(commentaire.getCommentaire());
                isModified = true;
            }
           if (!commentaire.getObjet().isEmpty() && !commentaire.getObjet().equals(existingCommentaire.getObjet())) {
                existingCommentaire.setObjet(commentaire.getObjet());
                isModified = true;
            }
           if (!commentaire.getRedacteur().isEmpty() && !commentaire.getRedacteur().equals(existingCommentaire.getRedacteur())) {
                existingCommentaire.setRedacteur(commentaire.getRedacteur());
                isModified = true;
            }
            if (isModified) {
                return commentaireRepository.save(existingCommentaire);
            } else {
                throw new ServiceException("No changes detected for commentaire with ID: " + commentaire.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update commentaire", e);
        }
    }

    public void deleteCommentaireById(int id) {
        try {
            commentaireRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete commentaire with Id: " + id, e);
        }
    }
}
