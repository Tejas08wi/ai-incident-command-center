package com.tejaswi.incident_command_center.dto;

public class AiResponseDto {

    private String response;

    public AiResponseDto() {
    }

    public AiResponseDto(String response) {
        this.response = response;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}