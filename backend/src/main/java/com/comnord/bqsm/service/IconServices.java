package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.IconEntity;
import com.comnord.bqsm.repository.IconRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IconServices {

    @Autowired
    private IconRepository iconRepository;

    public Iterable<IconEntity> getAllIcons() {
        try {
            return iconRepository.findAll();
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve icons", e);
        }
    }

    public IconEntity getIconById(int id) {
        try {
            return iconRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Icon not found with ID: " + id));
        } catch (ServiceException e) {
            throw new ServiceException("Icon not found with ID: " + id, e);
        }
    }

    public IconEntity saveIcon(IconEntity icon) {
        try {
            return iconRepository.save(icon);
        } catch (Exception e) {
            throw new ServiceException("Failed to save icon", e);
        }
    }

    public void deleteIconById(int id) {
        try {
            IconEntity icon = iconRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Icon not found with ID: " + id));
            iconRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete icon with ID: " + id, e);
        }
    }

    public IconEntity updateIcon(int id, IconEntity icon) {
        try {
            IconEntity existingIcon = getIconById(id);
            existingIcon.setIconName(icon.getIconName());
            existingIcon.setIcon(icon.getIcon());
            return iconRepository.save(existingIcon);
        } catch (Exception e) {
            throw new ServiceException("Failed to update icon with ID: " + id, e);
        }
    }
}
