package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.IconsNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.IconByBreve;
import com.comnord.bqsm.repository.IconByBreveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IconByBreveServices {

    @Autowired
    private IconByBreveRepository iconByBreveRepository;

    @Autowired
    private BreveServices breveServices;

    @Autowired
    private IconServices iconServices;

    public List<IconByBreve> getAllIconsByBreveId(BreveEntity breveId) {
        try {
            List<IconByBreve> icons = iconByBreveRepository.findAllIconByBreveId(breveId);
            return icons;
        } catch (IconsNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve icons", e);
        }
    }

    public IconByBreve saveIconByBreve(IconByBreve iconByBreve) {
        try {
            return iconByBreveRepository.save(iconByBreve);
        } catch (Exception e) {
            throw new ServiceException("Failed to save icon by breve", e);
        }
    }

    public void deleteIconByBreveById(int id) {
        try {
            iconByBreveRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete icon by breve with ID: " + id, e);
        }
    }
}
