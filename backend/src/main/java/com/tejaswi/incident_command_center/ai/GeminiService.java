package com.tejaswi.incident_command_center.ai;

import com.tejaswi.incident_command_center.exception.AiServiceException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final ChatClient chatClient;

    public GeminiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generateResponse(String prompt) {

        try {

            return chatClient
                    .prompt()
                    .user(prompt)
                    .call()
                    .content();

        } catch (Exception e) {

            throw new AiServiceException(
                    "AI service is temporarily unavailable",
                    e
            );
        }
    }
}