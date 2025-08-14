package com.comnord.bqsm.exception;

public class PicturesNotFoundException extends RuntimeException {

    public PicturesNotFoundException(String message) {
        super(message);
    }

    public PicturesNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
