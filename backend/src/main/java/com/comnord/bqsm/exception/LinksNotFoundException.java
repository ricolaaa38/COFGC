package com.comnord.bqsm.exception;

public class LinksNotFoundException extends RuntimeException {

    public LinksNotFoundException(String message) {
        super(message);
    }

    public LinksNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
