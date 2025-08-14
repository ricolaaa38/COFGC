package com.comnord.bqsm.exception;

public class IconsNotFoundException extends RuntimeException {
    public IconsNotFoundException(String message) {
        super(message);
    }
    public IconsNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
