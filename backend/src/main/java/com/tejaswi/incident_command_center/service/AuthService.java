package com.tejaswi.incident_command_center.service;

import com.tejaswi.incident_command_center.dto.LoginRequestDto;
import com.tejaswi.incident_command_center.dto.LoginResponseDto;
import com.tejaswi.incident_command_center.dto.RegisterRequestDto;

public interface AuthService {

    void register(RegisterRequestDto request);

    LoginResponseDto login(LoginRequestDto request);
}