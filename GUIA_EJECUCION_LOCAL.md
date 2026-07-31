# Mementoweb — Guía de ejecución local

Esta guía explica cómo levantar y detener el entorno completo de **Mementoweb** en Windows usando PowerShell.

## Servicios y puertos

| Servicio | Dirección o puerto |
| --- | --- |
| Frontend Angular | `http://localhost:4200` |
| Backend Spring Boot | `http://localhost:8081` |
| PostgreSQL desde Windows | `localhost:5433` |
| PostgreSQL dentro de Docker | `5432` |

El mapeo de PostgreSQL es:

```text
Windows:5433 → contenedor:5432
```

Angular utiliza un proxy de desarrollo para reenviar las peticiones:

```text
localhost:4200/api/** → localhost:8081/api/**
```

## Requisitos

Antes de empezar, comprobar que están instalados:

- Docker Desktop.
- Java 21.
- Node.js 22.
- npm.

No es necesario instalar Maven ni Angular CLI globalmente: el proyecto utiliza Maven Wrapper y los comandos definidos en `package.json`.

## Ciclo local completo

Los servicios deben levantarse en este orden:

1. Docker Desktop.
2. PostgreSQL.
3. Spring Boot.
4. Angular.

### 1. Abrir Docker Desktop

Iniciar Docker Desktop y esperar hasta que el motor de Docker esté disponible.

### 2. Levantar PostgreSQL

Abrir una terminal PowerShell en la raíz del repositorio, donde se encuentra el archivo de Docker Compose:

```powershell
docker compose up -d postgres
```

Comprobar el estado:

```powershell
docker compose ps
```

El contenedor `mementoweb-postgres` debe aparecer en ejecución. El `healthcheck` puede tardar unos segundos en marcarlo como saludable.

### 3. Levantar Spring Boot

Sin cerrar PostgreSQL, abrir una segunda terminal PowerShell en la raíz del repositorio:

```powershell
.\mvnw.cmd spring-boot:run
```

El backend quedará disponible en:

```text
http://localhost:8081
```

La terminal debe permanecer abierta mientras se utiliza la aplicación.

### 4. Levantar Angular

Abrir una tercera terminal PowerShell:

```powershell
cd frontend
npm start
```

El frontend quedará disponible en:

```text
http://localhost:4200
```

La terminal debe permanecer abierta mientras se utiliza la aplicación.

## Comprobaciones rápidas

### Abrir la aplicación

```text
http://localhost:4200
```

### Comprobar la API a través del proxy de Angular

```text
http://localhost:4200/api/articles?page=0&size=10
```

Debe devolver un JSON paginado, aunque no existan artículos:

```json
{
  "content": [],
  "page": 0,
  "size": 10,
  "totalElements": 0,
  "totalPages": 0
}
```

### Comprobar directamente el backend

```text
http://localhost:8081/api/articles?page=0&size=10
```

## Detener el entorno

### 1. Detener Angular

En la terminal de Angular:

```text
Ctrl + C
```

### 2. Detener Spring Boot

En la terminal de Spring:

```text
Ctrl + C
```

### 3. Detener PostgreSQL

Desde la raíz del repositorio:

```powershell
docker compose down
```

Este comando detiene los contenedores y conserva los datos guardados en el volumen de PostgreSQL.

> [!CAUTION]
> No ejecutar `docker compose down -v` salvo que se quiera borrar deliberadamente la base de datos local.

## Verificación del proyecto

Estas comprobaciones no son necesarias para levantar la aplicación, pero deben ejecutarse después de cambios relevantes.

### Tests del backend

Con PostgreSQL levantado, desde la raíz:

```powershell
.\mvnw.cmd clean test
```

### Compilación del frontend

Desde la carpeta `frontend`:

```powershell
npm run build
```

## Problemas frecuentes

### Docker no responde

Comprobar que Docker Desktop está abierto y que su motor ha terminado de arrancar.

### Spring no conecta con PostgreSQL

Comprobar:

```powershell
docker compose ps
```

PostgreSQL debe estar en ejecución y accesible desde Windows mediante el puerto `5433`.

### El puerto ya está ocupado

Los puertos esperados son:

- PostgreSQL: `5433`.
- Spring Boot: `8081`.
- Angular: `4200`.

Comprobar que no existe otra instancia de Mementoweb utilizando esos puertos.

### Angular devuelve un error de conexión

Comprobar que:

1. Spring sigue ejecutándose.
2. El backend responde directamente en el puerto `8081`.
3. Angular se inició mediante `npm start`, que carga `proxy.conf.json`.

Si se ha modificado el proxy, detener Angular con `Ctrl + C` y volver a ejecutar:

```powershell
npm start
```

### La API devuelve una lista vacía

Una respuesta con:

```json
"content": []
```

no es un error. Significa que actualmente no existen artículos publicados.

## Resumen de comandos

### Arranque

```powershell
# Terminal 1 — raíz del repositorio
docker compose up -d postgres

# Terminal 2 — raíz del repositorio
.\mvnw.cmd spring-boot:run
.\mvnw.cmd clean spring-boot:run

$env:MEMENTO_ADMIN_USERNAME = "admin"
$env:MEMENTO_ADMIN_PASSWORD = "admin"

# Terminal 3
cd frontend
npm start
```

### Apagado

```text
Ctrl + C  → terminal de Angular
Ctrl + C  → terminal de Spring
```

```powershell
# Desde la raíz del repositorio
docker compose down
```

