package com.hospital.controller;

import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    record Err(String code, String message, LocalDateTime ts, Map<String,String> errors) {}

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Err> handleBad(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(new Err("BAD_REQUEST",ex.getMessage(),LocalDateTime.now(),null));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Err> handleValidation(MethodArgumentNotValidException ex) {
        Map<String,String> errs = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(e -> errs.put(((FieldError)e).getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new Err("VALIDATION",ex.getMessage(),LocalDateTime.now(),errs));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Err> handleGeneral(Exception ex) {
        return ResponseEntity.internalServerError().body(new Err("INTERNAL",ex.getMessage(),LocalDateTime.now(),null));
    }
}