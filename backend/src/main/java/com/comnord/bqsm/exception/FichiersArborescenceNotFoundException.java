package com.comnord.bqsm.exception;

public class FichiersArborescenceNotFoundException extends RuntimeException {

    public FichiersArborescenceNotFoundException(String message) {
        super(message);
    }

    public FichiersArborescenceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
