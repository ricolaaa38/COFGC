package com.comnord.bqsm.exception;

public class ContributeursNotFoundException extends RuntimeException {

    public ContributeursNotFoundException(String message) {
        super(message);
    }

    public ContributeursNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
