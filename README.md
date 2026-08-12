# Memento vivere

Aplicación web editorial para publicar ensayos y reflexiones sobre videojuegos, cultura y memoria.

[Ver aplicación desplegada](https://memento-web-0yld.onrender.com)

> La demo utiliza infraestructura gratuita y puede tardar unos segundos en arrancar después de un periodo de inactividad.

## Sobre el proyecto

Memento vivere es una aplicación full stack desarrollada para gestionar todo el ciclo de publicación de artículos:

- Creación y edición de borradores.
- Publicación, retirada y republicación.
- Portada con artículos destacados y paginación.
- Imágenes de portada y audio recomendado.
- Contenido enriquecido mediante Markdown seguro.
- Panel editorial privado.
- Diseño adaptable a escritorio y móvil.

El proyecto combina una web pública orientada a lectores con una herramienta administrativa para gestionar el contenido sin modificar directamente la base de datos.

## Tecnologías

| Área | Tecnologías |
|---|---|
| Backend | Java 21, Spring Boot, Spring MVC, Spring Security, JPA/Hibernate |
| Frontend | Angular, TypeScript, HTML y SCSS |
| Base de datos | PostgreSQL y Flyway |
| Seguridad | Sesiones, CSRF, BCrypt, limitación de intentos y cabeceras de seguridad |
| Testing | JUnit, Spring Boot Test, Testcontainers y Vitest |
| Infraestructura | Docker, Render y Neon PostgreSQL |

## Funcionalidades destacadas

### Área pública

- Portada con el último artículo destacado.
- Carga paginada de publicaciones.
- Artículos con portada, audio recomendado y Markdown.
- Enlaces externos saneados y abiertos de forma segura.
- Metadatos SEO y sociales específicos para cada artículo.
- `sitemap.xml`, `robots.txt` y respuestas `404` reales.

### Área editorial

- Inicio de sesión mediante sesión segura.
- Creación y edición de artículos.
- Estados `DRAFT`, `PUBLISHED` y `WITHDRAWN`.
- Validación previa a la publicación.
- Aviso de cambios sin guardar.
- Previsualización de imagen y audio.
- Filtros y paginación administrativa.

## Calidad y operación

El proyecto incluye medidas pensadas para un entorno real:

- Migraciones versionadas con Flyway.
- Validación en frontend, backend y dominio.
- Protección CSRF y cookies de sesión seguras en producción.
- Limitación de intentos de acceso.
- Saneamiento del HTML generado desde Markdown.
- Errores API basados en `ProblemDetail`.
- Identificador de correlación para localizar incidencias en los logs.
- Health check para el despliegue.
- Auditoría de dependencias.
- Copias de seguridad y restauración verificadas de PostgreSQL.
- Tests automatizados de backend y frontend.

## Arquitectura

La aplicación se distribuye como una única imagen Docker:

- Angular proporciona la interfaz pública y administrativa.
- Spring Boot expone la API REST, aplica seguridad y sirve el frontend compilado.
- PostgreSQL conserva artículos y estados editoriales.
- Render ejecuta la aplicación.
- Neon aloja la base de datos de producción.

Spring también genera los metadatos iniciales de cada página para que buscadores y redes sociales puedan interpretar correctamente una aplicación Angular.

## Ejecución local

Requisitos:

- Docker Desktop
- Git

Crea un archivo `.env` en la raíz:

```env
MEMENTO_ADMIN_USERNAME=local-admin
MEMENTO_ADMIN_PASSWORD=una-contrasena-local-segura
```

La contraseña debe contener al menos 15 caracteres.

Levanta la aplicación:

```bash
docker compose up --build -d
```

Después abre:

```text
http://localhost:8081
```

Para detenerla sin eliminar la base de datos:

```bash
docker compose down
```

## Pruebas

El backend utiliza Testcontainers, por lo que Docker debe estar disponible:

```bash
./mvnw clean verify
```

En Windows:

```powershell
.\mvnw.cmd clean verify
```

Frontend:

```bash
cd frontend
npm ci
npm run build
npm test -- --watch=false
```

## Decisiones de diseño

- Autenticación mediante sesión en lugar de almacenar credenciales o tokens en el navegador.
- Markdown limitado y saneado para equilibrar capacidad editorial y seguridad.
- Metadatos generados por Spring para que compartir y posicionar artículos no dependa de ejecutar JavaScript.
- Comentarios públicos aplazados hasta poder incorporar moderación y protección frente a spam.

## Próximos pasos

- Dominio propio.
- Comentarios con moderación previa.
- Despliegue alternativo en AWS como ampliación de infraestructura.

## Autor

Desarrollado por [José Antonio Rodríguez Martín](https://github.com/DoctoreJekyll).