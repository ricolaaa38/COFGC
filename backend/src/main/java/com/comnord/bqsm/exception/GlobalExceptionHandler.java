package com.comnord.bqsm.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<String> handleServiceException(ServiceException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }

    @ExceptionHandler(CommentairesNotFoundException.class)
    public ResponseEntity<String> handleCommentairesNotFound(CommentairesNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(PicturesNotFoundException.class)
    public ResponseEntity<String> handlePicturesNotFound(PicturesNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IntervenantsNotFoundException.class)
    public ResponseEntity<String> handleIntervenantsNotFound(IntervenantsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(ContributeursNotFoundException.class)
    public ResponseEntity<String> handleContributeursNotFound(ContributeursNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(BrevesNotFoundException.class)
    public ResponseEntity<String> handleBrevesNotFound(BrevesNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<String> handleInvalidFileException(InvalidFileException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(BrevesViewTrackerNotFoundException.class)
    public ResponseEntity<String> handleBrevesViewTrackerNotFound(BrevesViewTrackerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(ApplicationViewTrackerNotFound.class)
    public ResponseEntity<String> handleApplicationViewTrackerNotFound(ApplicationViewTrackerNotFound ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(LinksNotFoundException.class)
    public ResponseEntity<String> handleLinksNotFound(LinksNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(FiltresNotFoundException.class)
    public ResponseEntity<String> handleFiltresNotFound(FiltresNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(DossierArborescenceNotFoundException.class)
    public ResponseEntity<String> handleDossierArborescenceNotFound(DossierArborescenceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(FichiersArborescenceNotFoundException.class)
    public ResponseEntity<String> handleFichiersArborescenceNotFound(FichiersArborescenceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IconsNotFoundException.class)
    public ResponseEntity<String> handleIconsNotFound(IconsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(DataExtractionException.class)
    public ResponseEntity<String> handleDataExtractionException(DataExtractionException ex) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occured: " + ex.getMessage());
    }

}
