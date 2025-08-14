package com.comnord.bqsm.service;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WordDocumentService {

    private static final Logger  logger = LoggerFactory.getLogger(WordDocumentService.class);

    private static final String BREVES_MARKER = "Breves";
    private static final String BQSM_DATE_MARKER = "BqsmNum";
    private static final String DATE_MARKER = "Date";
    private static final String TITRE_MARKER = "Titre";
    private static final String CATEGORIE_MARKER = "Categorie";
    private static final String ZONE_MARKER = "Zone_lieu";
    private static final String PAYS_MARKER = "Pays";
    private static final String LATITUDE_MARKER = "Latitude";
    private static final String LONGITUDE_MARKER = "Longitude";
    private static final String CONTENU_MARKER = "Contenu";

    public List<Map<String, String>> processDocument(MultipartFile file) throws IOException {
        List<Map<String, String>> extractedDataList = new ArrayList<>();
        try (InputStream is = file.getInputStream()) {
            XWPFDocument document = new XWPFDocument(is);
            List<XWPFParagraph> paragraphs = document.getParagraphs();

            Map<String, String> currentData = new HashMap<>();
            String currentKey = null;
            StringBuilder currentValue = new StringBuilder();

            for (XWPFParagraph paragraph : paragraphs) {
                String text = paragraph.getText().trim();
                logger.debug("Paragraph text: {}", text);

                if (text.equalsIgnoreCase(BREVES_MARKER)) {
                    if (currentKey != null) {
                        currentData.put(currentKey, currentValue.toString().trim());
                        logger.debug("Saved data for key: {}", currentKey);
                    }
                    if (!currentData.isEmpty()) {
                        extractedDataList.add(currentData);
                        currentData = new HashMap<>();
                    }
                    currentKey = null;
                    currentValue = new StringBuilder();
                } else if (startWithAnyMarker(text)) {
                    saveCurrentData(currentData, currentKey, currentValue);
                    currentKey = getKeyForMarker(text);
                    currentValue = new StringBuilder(getTextAfterMarker(text, currentKey));
                } else if (!text.isEmpty()) {
                    appendToCurrentValue(currentKey, currentValue, text);
                }
            }
            saveCurrentData(currentData, currentKey, currentValue);
            if (!currentData.isEmpty()) {
                extractedDataList.add(currentData);
            }
        }
        return extractedDataList;
    }

    private void appendToCurrentValue(String currentKey, StringBuilder currentValue, String text) {
        if (currentKey != null) {
            currentValue.append(" ").append(text);
        }
    }

    private String getTextAfterMarker(String text, String currentKey) {
        switch (currentKey) {
            case "BqsmNum": return text.substring(BQSM_DATE_MARKER.length()).trim();
            case "Date": return text.substring(DATE_MARKER.length()).trim();
            case "Titre": return text.substring(TITRE_MARKER.length()).trim();
            case "Categorie": return text.substring(CATEGORIE_MARKER.length()).trim();
            case "Zone_lieu": return text.substring(ZONE_MARKER.length()).trim();
            case "Pays": return text.substring(PAYS_MARKER.length()).trim();
            case "Latitude": return text.substring(LATITUDE_MARKER.length()).trim();
            case "Longitude": return text.substring(LONGITUDE_MARKER.length()).trim();
            case "Contenu": return text.substring(CONTENU_MARKER.length()).trim();
            default: return "";
        }
    }

    private String getKeyForMarker(String text) {
        if (text.startsWith(BQSM_DATE_MARKER)) return "BqsmNum";
        if (text.startsWith(DATE_MARKER)) return "Date";
        if (text.startsWith(TITRE_MARKER)) return "Titre";
        if (text.startsWith(CATEGORIE_MARKER)) return "Categorie";
        if (text.startsWith(ZONE_MARKER)) return "Zone_lieu";
        if (text.startsWith(PAYS_MARKER)) return "Pays";
        if (text.startsWith(LATITUDE_MARKER)) return "Latitude";
        if (text.startsWith(LONGITUDE_MARKER)) return "Longitude";
        if (text.startsWith(CONTENU_MARKER)) return "Contenu";
        return null;
    }

    private void saveCurrentData(Map<String, String> currentData, String currentKey, StringBuilder currentValue) {
        if (currentKey != null) {
            currentData.put(currentKey, currentValue.toString().trim());
            logger.debug("Saved data for key: {}", currentKey);
        }
    }

    private boolean startWithAnyMarker(String text) {
        return text.startsWith(BQSM_DATE_MARKER) ||
                text.startsWith(DATE_MARKER) ||
                text.startsWith(TITRE_MARKER) ||
                text.startsWith(CATEGORIE_MARKER) ||
                text.startsWith(ZONE_MARKER) ||
                text.startsWith(PAYS_MARKER) ||
                text.startsWith(LATITUDE_MARKER) ||
                text.startsWith(LONGITUDE_MARKER) ||
                text.startsWith(CONTENU_MARKER);
    }
}
