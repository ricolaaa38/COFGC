package com.comnord.bqsm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
public class ForwardedAccessTokenFilter extends OncePerRequestFilter {

    private static final String FORWARDED_HEADER = "x-forwarded-access-token";
    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String forwardedToken = request.getHeader(FORWARDED_HEADER);

        if (forwardedToken == null || forwardedToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        String authValue = forwardedToken.startsWith(BEARER_PREFIX)
                ? forwardedToken
                : BEARER_PREFIX + forwardedToken;

        HttpServletRequestWrapper wrapped = new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if (AUTH_HEADER.equalsIgnoreCase(name)) {
                    return authValue;
                }
                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaders(String name) {
                if (AUTH_HEADER.equalsIgnoreCase(name)) {
                    return Collections.enumeration(List.of(authValue));
                }
                return super.getHeaders(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                Set<String> names = new LinkedHashSet<>(Collections.list(super.getHeaderNames()));
                names.add(AUTH_HEADER);
                return Collections.enumeration(names);
            }
        };

        filterChain.doFilter(wrapped, response);
    }
}
