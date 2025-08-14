package com.comnord.bqsm.exception;

public class FiltresNotFoundException extends RuntimeException {

    public FiltresNotFoundException(String message) {
        super(message);
    }

    public FiltresNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
