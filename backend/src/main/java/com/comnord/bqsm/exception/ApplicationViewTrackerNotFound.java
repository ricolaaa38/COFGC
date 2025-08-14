package com.comnord.bqsm.exception;

public class ApplicationViewTrackerNotFound extends RuntimeException {

    public ApplicationViewTrackerNotFound(String message) {
        super(message);
    }
    public ApplicationViewTrackerNotFound(String message, Throwable cause) {
        super(message, cause);
    }
}
