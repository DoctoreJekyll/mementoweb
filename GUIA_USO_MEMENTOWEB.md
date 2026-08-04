# Guía rápida de uso de Memento Web

Esta guía describe cómo arrancar y detener Memento Web en su estado actual: frontend Angular y backend Spring Boot empaquetados en el contenedor `app`, junto con PostgreSQL en el contenedor `postgres`.

## 1. Arranque local habitual

Abre PowerShell y sitúate en la raíz del proyecto:
Define las credenciales del administrador en esa misma terminal:

```powershell
$env:MEMENTO_ADMIN_USERNAME="TU_USUARIO"
$env:MEMENTO_ADMIN_PASSWORD="UNA_CONTRASEÑA_SEGURA"
```

Estas variables solo existen en la terminal actual. No deben guardarse en Git ni escribirse directamente en `application.properties` o `docker-compose.yml`.

Levanta la aplicación y PostgreSQL:

```powershell
docker compose up -d
```

Comprueba el estado de los contenedores:

```powershell
docker compose ps
```

Cuando `app` y `postgres` estén en ejecución, abre:

- Portada: <http://localhost:8081>
- Administración: <http://localhost:8081/admin/login>

No hace falta ejecutar `npm start`, `ng serve` ni `mvnw spring-boot:run`: el contenedor `app` ya incluye Angular y Spring Boot.

## 2. Arranque después de modificar el código

Si has cambiado Java, Angular, dependencias o archivos incluidos en la imagen, reconstruye antes de arrancar:

```powershell
docker compose up -d --build
```

`docker compose up -d` reutiliza la imagen existente. La opción `--build` vuelve a compilar Angular, genera el JAR de Spring Boot y crea una imagen actualizada.

## 3. Acceso temporal desde Internet con ngrok

Primero asegúrate de que Memento Web funciona localmente en:

```
http://localhost:8081
```

La primera vez que configures ngrok, registra el authtoken de tu cuenta:

```powershell
ngrok config add-authtoken TU_AUTHTOKEN
```

El authtoken solo se configura una vez y no debe añadirse al repositorio.

Abre una segunda terminal y ejecuta:

```powershell
ngrok http 8081
```

Ngrok mostrará una URL HTTPS similar a:

```text
https://ejemplo.ngrok-free.app
```

La portada y la administración estarán disponibles en:

```text
https://ejemplo.ngrok-free.app
https://ejemplo.ngrok-free.app/admin/login
```

El túnel solo funciona mientras se mantengan activos:

- Docker Desktop.
- Los contenedores `app` y `postgres`.
- El proceso de ngrok.
- El ordenador y su conexión a Internet.

La terminal que ejecuta ngrok debe permanecer abierta. Los contenedores pueden seguir funcionando aunque cierres la terminal desde la que ejecutaste `docker compose up -d`.

## 4. Detener la aplicación

Detén primero ngrok pulsando `Ctrl + C` en su terminal.

Para detener los contenedores conservándolos y manteniendo los datos:

```powershell
docker compose stop
```

Para detener y retirar los contenedores y la red de Compose:

```powershell
docker compose down
```

`docker compose down` conserva el volumen con los artículos. No utilices `docker compose down -v` salvo que quieras borrar también la base de datos.

## 5. Consultar estado y errores

Ver el estado de los servicios:

```powershell
docker compose ps
```

Ver los logs de la aplicación:

```powershell
docker compose logs -f app
```

Ver los logs de PostgreSQL:

```powershell
docker compose logs -f postgres
```

Pulsa `Ctrl + C` para salir de la visualización de logs. Esto no detiene los contenedores.

## 6. Secuencia resumida

### Solo uso local

```text
Abrir PowerShell
→ entrar en la raíz del proyecto
→ definir las dos variables MEMENTO_ADMIN_*
→ docker compose up -d
→ abrir http://localhost:8081
```

### Uso mediante ngrok

```text
Realizar el arranque local
→ abrir una segunda terminal
→ ngrok http 8081
→ utilizar la URL HTTPS proporcionada
```

### Después de cambiar código

```text
Definir las credenciales
→ docker compose up -d --build
→ comprobar docker compose ps
```

## 7. Recomendaciones de seguridad

- Usa una contraseña administrativa larga y exclusiva antes de iniciar ngrok.
- No compartas el authtoken de ngrok.
- No subas credenciales ni archivos `.env` al repositorio.
- Comparte la URL temporal solo con personas de confianza durante las pruebas.
- PostgreSQL no necesita exponerse mediante ngrok; únicamente se publica el puerto 8081 de la aplicación.
