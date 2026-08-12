package com.jose.mementoweb.seo;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.util.HtmlUtils;

import com.jose.mementoweb.domain.article.Article;
import com.jose.mementoweb.service.PublicArticleService;

@Controller
public class SeoResourceController {

    private static final MediaType TEXT_UTF_8 = new MediaType(
            MediaType.TEXT_PLAIN,
            StandardCharsets.UTF_8);

    private static final MediaType XML_UTF_8 = new MediaType(
            MediaType.APPLICATION_XML,
            StandardCharsets.UTF_8);

    private final PublicArticleService publicArticleService;

    private final PublicUrlBuilder publicUrlBuilder;

    public SeoResourceController(
            PublicArticleService publicArticleService,
            PublicUrlBuilder publicUrlBuilder) {

        this.publicArticleService = publicArticleService;

        this.publicUrlBuilder = publicUrlBuilder;
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {

        String content = """
                User-agent: *
                Allow: /
                Disallow: /admin
                Disallow: /api/
                Disallow: /actuator/
                Sitemap: %s
                """
                .formatted(
                        publicUrlBuilder
                                .sitemapUrl());

        return ResponseEntity
                .ok()
                .contentType(TEXT_UTF_8)
                .body(content);
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {

        List<Article> articles = publicArticleService
                .getAllPublishedArticles();

        StringBuilder xml = new StringBuilder();

        xml.append(
                """
                        <?xml version="1.0" encoding="UTF-8"?>
                        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                        """);

        appendUrl(
                xml,
                publicUrlBuilder.homeUrl(),
                null);

        for (Article article : articles) {
            appendUrl(
                    xml,
                    publicUrlBuilder.articleUrl(
                            article.getSlug()),
                    article.getPublishedAt() == null
                            ? null
                            : DateTimeFormatter.ISO_OFFSET_DATE_TIME
                                    .format(
                                            article
                                                    .getPublishedAt()));
        }

        xml.append("</urlset>");

        return ResponseEntity
                .ok()
                .contentType(XML_UTF_8)
                .body(xml.toString());
    }

    private static void appendUrl(
            StringBuilder xml,
            String location,
            String lastModified) {

        xml.append("  <url>\n");

        xml.append("    <loc>")
                .append(xmlEscape(location))
                .append("</loc>\n");

        if (lastModified != null
                && !lastModified.isBlank()) {

            xml.append("    <lastmod>")
                    .append(
                            xmlEscape(
                                    lastModified))
                    .append("</lastmod>\n");
        }

        xml.append("  </url>\n");
    }

    private static String xmlEscape(
            String value) {

        return HtmlUtils.htmlEscape(value);
    }
}