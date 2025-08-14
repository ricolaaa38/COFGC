package com.comnord.bqsm.service;

import com.comnord.bqsm.exception.LinksNotFoundException;
import com.comnord.bqsm.exception.ServiceException;
import com.comnord.bqsm.model.BreveEntity;
import com.comnord.bqsm.model.LinkEntity;
import com.comnord.bqsm.repository.LinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LinkServices {

    @Autowired
    private LinkRepository linkRepository;

    @Autowired
    private BreveServices breveServices;

    public List<LinkEntity> getLinksByBreveId(BreveEntity breveId) {
        try {
            List<LinkEntity> links = linkRepository.findAllLinksByBreveId(breveId);
            return links;
        } catch (Exception e) {
            throw new ServiceException("Failed to retrieve links", e);
        }
    }

    public LinkEntity saveLink(LinkEntity link) {
        try {
            return linkRepository.save(link);
        } catch (Exception e) {
            throw new ServiceException("Failed to save link", e);
        }
    }

    public LinkEntity updateLink(LinkEntity link, LinkEntity existingLink) {
        try {
            boolean isModified = false;
            if (!link.getName().isEmpty() && !link.getName().equals(existingLink.getName())) {
                existingLink.setName(link.getName());
                isModified = true;
            }
           if (!link.getLink().isEmpty() && !link.getLink().equals(existingLink.getLink())) {
               existingLink.setLink(link.getLink());
               isModified = true;
           }
            if (isModified) {
                return linkRepository.save(existingLink);
            } else {
                throw new ServiceException("No changes detected for link with ID: " + link.getId());
            }
        } catch (Exception e) {
            throw new ServiceException("Failed to update link", e);
        }
    }

    public void deleteLinkById(int id) {
        try {
            linkRepository.deleteById(id);
        } catch (Exception e) {
            throw new ServiceException("Failed to delete link with ID: " + id, e);
        }
    }
}
