package com.tejaswi.incident_command_center.dto;

import jakarta.validation.constraints.NotBlank;

public class AiRequestDto {

    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;

    public AiRequestDto() {
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}