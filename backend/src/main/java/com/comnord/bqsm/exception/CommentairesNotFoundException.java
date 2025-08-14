package com.comnord.bqsm.exception;

public class CommentairesNotFoundException extends RuntimeException {

    public CommentairesNotFoundException(String message) {
        super(message);
    }

    public CommentairesNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
