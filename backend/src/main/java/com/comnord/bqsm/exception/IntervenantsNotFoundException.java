package com.comnord.bqsm.exception;

public class IntervenantsNotFoundException  extends RuntimeException {

    public IntervenantsNotFoundException(String message) {
        super(message);
    }

    public IntervenantsNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
