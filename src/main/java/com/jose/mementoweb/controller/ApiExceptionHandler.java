package com.jose.mementoweb.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.jose.mementoweb.exception.ArticleNotFoundException;
import com.jose.mementoweb.exception.ArticleStateException;
import com.jose.mementoweb.exception.PublishedArticleNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import org.slf4j.MDC;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String REQUEST_ID_MDC_KEY = "requestId";

    private static final String REQUEST_ID_PROPERTY = "requestId";

    private static final Logger LOGGER = LoggerFactory.getLogger(
            ApiExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpectedException(
            Exception exception) {

        LOGGER.error(
                "Unexpected error while processing request",
                exception);

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred.");

        problem.setTitle(
                "Internal server error");

        addRequestId(problem);

        return problem;
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception,
            Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {

        Object responseBody = body;

        if (responseBody == null) {
            responseBody = ProblemDetail.forStatus(
                    statusCode);
        }

        if (responseBody instanceof ProblemDetail problem) {
            addRequestId(problem);
        }

        return super.handleExceptionInternal(
                exception,
                responseBody,
                headers,
                statusCode,
                request);
    }

    @ExceptionHandler(ArticleNotFoundException.class)
    public ProblemDetail handleArticleNotFound(
            ArticleNotFoundException exception) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                exception.getMessage());

        problem.setTitle("Article not found");

        addRequestId(problem);
        return problem;
    }

    @ExceptionHandler(ArticleStateException.class)
    public ProblemDetail handleArticleStateException(
            ArticleStateException exception) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                exception.getMessage());

        problem.setTitle("Invalid article state");

        addRequestId(problem);
        return problem;
    }

    @ExceptionHandler(PublishedArticleNotFoundException.class)
    public ProblemDetail handlePublishedArticleNotFound(
            PublishedArticleNotFoundException exception) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                exception.getMessage());

        problem.setTitle("Published article not found");

        addRequestId(problem);
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgumentException(
            IllegalArgumentException exception) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                exception.getMessage());

        problem.setTitle("Invalid request");

        addRequestId(problem);
        return problem;
    }

    private static void addRequestId(
            ProblemDetail problem) {

        String requestId = MDC.get(REQUEST_ID_MDC_KEY);

        if (requestId != null
                && !requestId.isBlank()) {

            problem.setProperty(
                    REQUEST_ID_PROPERTY,
                    requestId);
        }
    }
}