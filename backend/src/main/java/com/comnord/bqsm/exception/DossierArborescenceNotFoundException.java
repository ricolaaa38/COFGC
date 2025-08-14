package com.comnord.bqsm.exception;

public class DossierArborescenceNotFoundException extends RuntimeException {

    public DossierArborescenceNotFoundException(String message) {
        super(message);
    }

    public DossierArborescenceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
