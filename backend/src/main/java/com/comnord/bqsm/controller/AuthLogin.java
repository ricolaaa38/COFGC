package com.comnord.bqsm.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthLogin {



    @GetMapping("/")
    public Map<String, Object> login(@AuthenticationPrincipal Jwt jwt) {
        // Récupération simple des rôles client (Keycloak)
        List<String> clientRoles = Optional.ofNullable(jwt.getClaim("resource_access"))
                .map(res -> (Map<String, Object>) res)
                .map(res -> (Map<String, Object>) res.get("bqsm-client"))
                .map(client -> (List<String>) client.get("roles"))
                .orElse(List.of());


        return Map.of(
                "message", "Login successful!",
                "email", jwt.getClaimAsString("email"),
                "roles", clientRoles,
                "claims", jwt.getClaims(),
                "token", jwt.getTokenValue()
        );
    }

    @GetMapping("/debug-auth")
    public Map<String, Object> debug(@RequestHeader Map<String, String> headers,
                                     @AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "headers", headers,
                "claims", jwt.getClaims()
        );
    }

}
