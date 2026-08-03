package com.jose.mementoweb.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({
        "/articulos/{slug}",
        "/admin",
        "/admin/**"
    })
    public String forwardToAngular() {
        return "forward:/index.html";
    }
}