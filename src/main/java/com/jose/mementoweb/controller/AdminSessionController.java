package com.jose.mementoweb.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jose.mementoweb.dto.AdminSessionResponse;

@RestController
@RequestMapping("/api/admin/session")
public class AdminSessionController {

    @GetMapping
    public ResponseEntity<AdminSessionResponse>
            getCurrentSession(Principal principal) {

        AdminSessionResponse response =
            new AdminSessionResponse(
                principal.getName()
            );

        return ResponseEntity.ok(response);
    }
}