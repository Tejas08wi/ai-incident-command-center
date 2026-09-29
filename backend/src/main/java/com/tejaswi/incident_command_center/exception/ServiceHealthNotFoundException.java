package com.tejaswi.incident_command_center.exception;

public class ServiceHealthNotFoundException extends RuntimeException {

    public ServiceHealthNotFoundException(String message) {
        super(message);
    }
}