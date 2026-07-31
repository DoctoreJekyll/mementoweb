package com.jose.mementoweb;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import org.springframework.context.annotation.Import;

import com.jose.mementoweb.config.TestcontainersConfiguration;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
class MementowebApplicationTests {

	@Test
	void contextLoads() {
	}

}
