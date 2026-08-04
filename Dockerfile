FROM node:22-alpine AS frontend-build

WORKDIR /build/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build


FROM maven:3.9.16-eclipse-temurin-21-alpine AS backend-build

WORKDIR /build

COPY pom.xml ./

COPY src ./src

COPY --from=frontend-build \
    /build/frontend/dist/mementoweb-frontend/browser \
    ./src/main/resources/static

RUN mvn clean package -DskipTests


FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S memento \
    && adduser -S memento -G memento

COPY --from=backend-build \
    --chown=memento:memento \
    /build/target/mementoweb-0.0.1-SNAPSHOT.jar \
    /app/app.jar

USER memento

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]