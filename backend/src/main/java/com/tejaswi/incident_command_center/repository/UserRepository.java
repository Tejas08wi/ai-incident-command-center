package com.tejaswi.incident_command_center.repository;

import com.tejaswi.incident_command_center.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}