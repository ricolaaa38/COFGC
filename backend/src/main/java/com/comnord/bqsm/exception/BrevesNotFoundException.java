package com.comnord.bqsm.exception;

public class BrevesNotFoundException extends RuntimeException {

    public BrevesNotFoundException(String message) {
        super(message);
    }

    public BrevesNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
