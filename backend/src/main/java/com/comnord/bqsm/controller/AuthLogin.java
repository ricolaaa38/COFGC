package com.comnord.bqsm.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthLogin {

    @GetMapping("/")
    public String login() {
        return "Login successful!";
    }
}
