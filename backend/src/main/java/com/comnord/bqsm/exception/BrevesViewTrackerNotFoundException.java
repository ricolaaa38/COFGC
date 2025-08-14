package com.comnord.bqsm.exception;

public class BrevesViewTrackerNotFoundException extends RuntimeException {

    public BrevesViewTrackerNotFoundException(String message) {
        super(message);
    }

    public BrevesViewTrackerNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
