package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.PicturesNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.PictureEntity;
import com.comnord.bqsm.repository.PictureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PictureServices {

    @Autowired
    private PictureRepository pictureRepository;

    @Autowired
    private BreveServices breveServices;

    public List<PictureEntity> getAllPictureByBreveId(BreveEntity breveId) {
        try {
            List<PictureEntity> pictures = pictureRepository.findAllPicturesByBreveId(breveId);
            return pictures;
        } catch (PicturesNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve pictures", e);
        }
    }

    public PictureEntity savePicture(PictureEntity picture) {
        try {
            return pictureRepository.save(picture);
        } catch (Exception e) {
            throw new ServiceException("Failed to save picture", e);
        }
    }

    public void deletePictureById(int id) {
        try {
            pictureRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete picture with ID: " + id, e);
        }
    }
}
