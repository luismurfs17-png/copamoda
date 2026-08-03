# COPAMODA: manual de despliegue y operación

Documento de referencia para el propietario, administradores y agentes de
desarrollo. Conserva la configuración real utilizada para publicar COPAMODA y
las lecciones aprendidas durante el despliegue en Hostinger VPS con Dokploy.

Última verificación: 2026-08-03.

## 1. Identidad y enlaces

```yaml
project_name: COPAMODA
owner_github: luismurfs17-png
owner_email: luismurfs17@gmail.com
repository: https://github.com/luismurfs17-png/copamoda
production_url: https://copamoda.copaapp.cloud
health_url: https://copamoda.copaapp.cloud/api/health
production_branch: main
hosting: Hostinger VPS
deployment_platform: Dokploy
build_type: Dockerfile
database: SQLite
docker_volume: copamoda_data
data_mount: /app/backend/data
container_port: 3000
```

El correo queda visible en este archivo y también en los metadatos públicos de
los commits. Si el repositorio se hace público y no se desea exponer el correo,
se debe sustituir por un correo técnico o por el correo privado de GitHub.

## 2. Cómo debe usar este archivo otro agente

Antes de modificar o desplegar COPAMODA, el agente debe:

1. Leer este archivo completo.
2. Leer `COPAMODA_CONTEXT.md` y `README.md`.
3. Ejecutar `git status` y no borrar cambios ajenos.
4. Confirmar la rama y el repositorio remoto.
5. Ejecutar lint, pruebas y build antes de hacer `push`.
6. No incluir contraseñas, tokens, webhooks ni archivos `.env` en Git.
7. Recordar que cada `push` a `main` puede desplegar automáticamente.
8. Mantener una sola réplica mientras la base sea SQLite.
9. Preservar el volumen `copamoda_data` en todos los despliegues.
10. Verificar `/api/health` y una función real después del despliegue.

Prompt recomendado para una terminal o agente nuevo:

```text
Lee DEPLOYMENT_RUNBOOK.md, COPAMODA_CONTEXT.md y README.md antes de actuar.
Inspecciona git status, la rama, el remoto y los archivos relevantes. No
expongas secretos ni modifiques cambios ajenos. Implementa el cambio mínimo,
ejecuta npm run lint, npm test y npm run build. Explica cualquier cambio de
base de datos, volumen, puerto, dominio o variable antes de desplegar.
```

## 3. Arquitectura actual

```text
Navegador o PWA
       |
       | HTTPS
       v
Traefik administrado por Dokploy
       |
       | puerto interno 3000
       v
Contenedor COPAMODA
       |
       +-- Express sirve /api
       +-- Express sirve frontend compilado
       +-- Knex administra migraciones y consultas
       |
       v
SQLite: /app/backend/data/copamoda.sqlite3
       |
       v
Volumen Docker: copamoda_data
```

El frontend React se compila dentro de Docker y queda en `backend/public`.
Express sirve tanto la PWA como la API desde el mismo dominio. Esto permite que
`VITE_API_URL=/api` funcione sin exponer otro dominio.

El comando de inicio del `Dockerfile` ejecuta, en este orden:

1. Migraciones pendientes.
2. Seed idempotente de definiciones de medidas.
3. Inicio del servidor Express.

## 4. Estado funcional y límites conocidos

Funciona actualmente:

- Clientes.
- Medidas históricas y definiciones iniciales.
- Pedidos.
- Pagos o abonos.
- Persistencia en volumen Docker.
- HTTPS.
- PWA y cola básica de escrituras sin conexión.
- Despliegue automático desde GitHub.

Pendiente antes de considerarla una aplicación completa de producción:

- No existe inicio de sesión propio de la aplicación.
- No existen cuentas, roles ni permisos por usuario.
- La API está públicamente accesible si no se activa seguridad externa.
- No se ha documentado una copia de respaldo externa ya operativa.
- No admite subir imágenes ni videos.
- No hay índice global terminado para todos los flujos de Pedidos y Pagos.
- La sincronización offline no resuelve conflictos entre varios dispositivos.
- El repositorio es público.
- Las dependencias reportan avisos de `npm audit` que deben revisarse sin usar
  `npm audit fix --force` de forma automática.

## 5. Requisitos de desarrollo

- Git.
- Node.js 18 o superior.
- npm.
- Docker y Docker Compose para validar la imagen completa.
- Acceso autorizado a GitHub.
- Acceso autorizado a Dokploy para operar producción.

Instalación local en Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
npm run migrate
npm run seed
npm run dev
```

Instalación local en Linux o macOS:

```bash
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`
- Salud: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`

## 6. Identidad Git en otra terminal

Si una terminal nueva no tiene identidad Git, se puede configurar solo dentro
de este repositorio:

```bash
git config user.name "luismurfs17-png"
git config user.email "luismurfs17@gmail.com"
```

El correo configurado queda registrado en cada commit. La autenticación contra
GitHub debe hacerse mediante el navegador, GitHub CLI o un token seguro. Nunca
se debe guardar un token en este documento o dentro del repositorio.

## 7. Primera subida a GitHub

Ejecutar desde la raíz del proyecto:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/luismurfs17-png/copamoda.git
git push -u origin main
```

Mensajes normales durante esta operación:

- `Reinitialized existing Git repository`: Git ya estaba inicializado.
- `nothing to commit, working tree clean`: no existen cambios nuevos.
- `remote origin already exists`: el repositorio remoto ya estaba conectado.
- `main -> main`: la rama se subió correctamente.

Si `origin` ya existe, primero se revisa:

```bash
git remote -v
```

Solo si apunta al lugar equivocado se corrige:

```bash
git remote set-url origin https://github.com/luismurfs17-png/copamoda.git
```

## 8. Flujo normal de cambios

No se actualiza la aplicación en tiempo real mientras un agente escribe. El
cambio llega a producción únicamente después de commit, push y despliegue.

```bash
git status
npm run lint
npm test
npm run build
git add RUTA_DE_LOS_ARCHIVOS_CAMBIADOS
git commit -m "descripcion breve del cambio"
git push
```

Dokploy está configurado con disparador `On Push`. Un push a `main` puede crear
un despliegue automáticamente. No se debe pulsar repetidamente `Deploy` si ya
existe un despliegue en curso.

Flujo recomendado para varios agentes:

1. Crear una rama por cambio, por ejemplo `feature/login`.
2. Un agente trabaja en una sola rama a la vez.
3. Ejecutar todas las verificaciones.
4. Revisar el diff.
5. Unir la rama a `main`.
6. Permitir que Dokploy despliegue `main`.

No usar `git push --force` ni sobrescribir trabajo de otros agentes.

## 9. Configuración exacta de Dokploy

### Proveedor Git

```yaml
provider: GitHub
github_account: COPAMODA
repository: copamoda
branch: main
build_path: /
trigger_type: On Push
auto_deploy: enabled
```

### Construcción

```yaml
build_type: Dockerfile
dockerfile_path: Dockerfile
docker_context_path: .
docker_build_stage: empty
```

El `Dockerfile` resuelve dos detalles importantes de los workspaces npm:

- Copia `backend/node_modules` y `frontend/node_modules` entre etapas.
- Instala el frontend con su propio lockfile para obtener el binario Linux de
  Rollup aunque el lockfile principal se haya generado en Windows.

### Variables de ejecución

Pegar una variable por línea en `Environment`:

```dotenv
NODE_ENV=production
PORT=3000
DB_CLIENT=sqlite3
SQLITE_FILENAME=/app/backend/data/copamoda.sqlite3
```

Variables opcionales:

```dotenv
API_PREFIX=/api
LOG_LEVEL=info
```

El frontend usa este argumento durante la construcción:

```dotenv
VITE_API_URL=/api
```

El `Dockerfile` ya define `/api` como valor predeterminado. Solo hace falta
añadirlo en `Build-time Arguments` si se desea sobrescribirlo.

No poner contraseñas o tokens en `Build-time Arguments`. Los secretos deben
permanecer en las funciones seguras de Dokploy.

### Dominio

```yaml
host: copamoda.copaapp.cloud
path: /
internal_path: /
container_port: 3000
https: enabled
certificate_provider: Lets Encrypt
entrypoint: websecure
```

No hace falta crear un puerto publicado en `Advanced` cuando el acceso se hace
por dominio y Traefik. El puerto 3000 es el puerto interno del contenedor.

### Volumen persistente

```yaml
mount_type: Volume Mount
volume_name: copamoda_data
mount_path: /app/backend/data
```

Solo se necesita este volumen para toda la base de datos. No se crea una
carpeta o volumen por cliente, medida, pedido, variable o usuario.

El volumen conserva datos entre reinicios y despliegues, pero no es una copia
de seguridad. Borrar el volumen, perder el VPS o llenar el disco puede causar
pérdida o indisponibilidad.

### Réplicas

Mientras se use SQLite:

```yaml
replicas: 1
```

No ejecutar varias réplicas escribiendo sobre el mismo archivo SQLite. Para
alta concurrencia o escalado horizontal se debe migrar a MySQL.

## 10. Despliegue con Docker Compose sin Dokploy

El repositorio incluye `docker-compose.yml` con el volumen persistente.

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Validación:

```bash
curl http://localhost:3000/api/health
```

Detener sin borrar datos:

```bash
docker compose down
```

No usar `docker compose down -v` en producción, porque `-v` elimina el volumen
y puede borrar la base de datos.

## 11. Verificación obligatoria

Antes del push:

```bash
npm ci --include=dev
npm run lint
npm test
npm run build
```

Si Docker está disponible:

```bash
docker build --no-cache -t copamoda:test .
```

Después del despliegue:

```bash
curl https://copamoda.copaapp.cloud/api/health
```

Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "sqlite3"
  },
  "message": "API running"
}
```

Pruebas manuales mínimas:

1. Abrir la página principal.
2. Confirmar que aparece un cliente existente.
3. Abrir el cliente.
4. Entrar en Medidas y comprobar definiciones superiores e inferiores.
5. Crear un pedido de prueba si corresponde.
6. Confirmar que el registro sigue existiendo después de un redespliegue.
7. Revisar `Logs` en Dokploy.

## 12. Errores encontrados y solución reutilizable

### Repositorio vacío

Síntoma: GitHub muestra `This repository is empty`.

Solución: hacer commit y `git push -u origin main` desde la carpeta correcta.

### Branch Not Match

Síntoma: Dokploy responde `{"message":"Branch Not Match"}`.

Solución: seleccionar la rama `main` en `General` y guardar.

### 404 page not found

Puede significar dominio, ruta o Traefik todavía no configurados. Revisar el
dominio, `/`, puerto interno 3000 y que exista un despliegue activo.

### Bad Gateway

Significa que Traefik recibe la petición, pero no puede conectar con la app.
Revisar `Deployments` y después `Logs`. Las causas comunes son contenedor
detenido, proceso de inicio fallido o puerto interno incorrecto.

### `vite: not found`

Causa encontrada: npm instaló Vite en `frontend/node_modules`, pero una etapa
Docker solo copiaba `node_modules` de la raíz.

Solución aplicada: copiar los directorios de dependencias de ambos workspaces
entre las etapas Docker e instalar devDependencies durante el build.

### `Cannot find module @rollup/rollup-linux-x64-gnu`

Causa encontrada: el lockfile principal se había generado en Windows y npm no
instaló correctamente una dependencia opcional nativa de Linux.

Solución aplicada en el `Dockerfile`:

```dockerfile
RUN npm ci --include=dev \
  && npm ci --prefix frontend --include=dev --include=optional
```

### Knex indica que falta `client`

Causa encontrada: `NODE_ENV=production` hacía que Knex buscara una
configuración `production`, pero el archivo solo exportaba `development`.

Solución aplicada: exportar la misma configuración calculada para desarrollo y
producción en `backend/knexfile.js`.

### `Validacion fallida` al abrir un cliente

Causa encontrada: el frontend enviaba `q=` vacío y Joi no acepta una cadena
vacía en ese filtro.

Solución aplicada: omitir `q` cuando no existe texto de búsqueda.

### `Validacion fallida` y URL `/clientes/demo/medidas/nueva`

Causa encontrada: la barra inferior contenía una ruta de demostración fija.
Además, el backend no enviaba las definiciones de medidas para un cliente sin
historial.

Solución aplicada:

- Ruta global `/medidas` para seleccionar primero un cliente real.
- Validación de UUID antes de consultar la API.
- Definiciones enviadas desde la base de datos.
- Prueba automática para clientes sin historial de medidas.

### La PWA conserva una versión anterior

La aplicación utiliza service worker. Se cambió la estrategia GET a
`NetworkFirst`, se incrementó el nombre de caché y se activaron `skipWaiting`
y `clientsClaim`.

Si un dispositivo todavía muestra una versión vieja:

1. Cerrar todas las pestañas de COPAMODA.
2. Abrir de nuevo la URL.
3. Usar `Ctrl + F5` una vez.
4. Si persiste, borrar los datos del sitio en el navegador.

### Avisos de `npm audit`

Los avisos no siempre detienen el build. Deben revisarse y actualizarse de
forma controlada. No ejecutar `npm audit fix --force` sin revisar cambios
mayores, compatibilidad, pruebas y lockfiles.

## 13. Qué sucede si se apaga el PC

La aplicación continúa funcionando porque vive en el VPS, no en el PC local.

Continúan operativos:

- Dominio y HTTPS.
- Contenedor en Dokploy.
- Base de datos dentro del volumen.
- GitHub.
- Despliegues automáticos ya configurados.

Se detiene únicamente el trabajo local del editor o agente. Los cambios sin
commit y sin push permanecen solo en ese PC y podrían perderse si falla el
disco. El código ya subido permanece en GitHub.

La app deja de estar disponible si se apaga el VPS, vence el plan, falla el
proveedor, se detiene el contenedor o se llena el disco.

## 14. Capacidad y almacenamiento

El volumen `copamoda_data` no tiene una cuota independiente. Puede crecer hasta
consumir el espacio libre del VPS. La capacidad exacta depende del plan de
Hostinger y se consulta en:

```text
Hostinger > VPS > Administrar > Información general
```

También se debe revisar `Monitoring` en Dokploy. COPAMODA comparte CPU, RAM y
disco con Chatwoot, n8n y cualquier otro servicio del mismo VPS.

Reglas operativas:

- Mantener entre 20 % y 30 % del disco libre.
- Vigilar el crecimiento de imágenes Docker, logs y backups locales.
- No guardar videos o imágenes pesadas dentro de SQLite.
- Configurar alertas de disco y memoria.
- Antes de ampliar el uso, conocer CPU, RAM y disco exactos del plan.

Si el disco se llena pueden fallar las escrituras, SQLite, Docker, los builds y
otros servicios del VPS.

Como orientación, los registros de texto ocupan poco. Miles de clientes,
pedidos y medidas suelen ser mucho más pequeños que una colección de fotos o
videos. El límite real suele aparecer primero por concurrencia, seguridad,
backups o archivos multimedia, no por los textos.

## 15. Usuarios y varios administradores

No se necesita un Dockerfile por administrador.

Para varios administradores del mismo negocio:

- Un dominio.
- Una aplicación.
- Una base de datos.
- Una cuenta individual por persona.
- Roles sugeridos: propietario, administrador y empleado.
- Registro de quién creó o modificó cada dato.

Para negocios independientes existen dos diseños:

1. Multiempresa: una aplicación con `organization_id` en todos los datos.
2. Instalaciones separadas: varias apps Dokploy usando el mismo repositorio y
   Dockerfile, pero con dominio, variables y base de datos separados.

Antes de introducir usuarios reales se recomienda implementar:

- Contraseñas con hash fuerte, nunca texto plano.
- Sesiones seguras en cookies `HttpOnly`, `Secure` y `SameSite`.
- Roles y permisos en el backend.
- Cierre de sesión y expiración.
- Recuperación de contraseña.
- Auditoría de acciones.
- Rate limiting.
- Restricción CORS al dominio autorizado.

SQLite puede servir inicialmente para un taller pequeño y baja concurrencia.
Como guía operativa, de uno a cinco usuarios simultáneos es un escenario
razonable, no una garantía. Para más escrituras concurrentes, múltiples sedes o
réplicas se recomienda MySQL.

## 16. Migración futura a MySQL

El backend ya contempla `mysql2`. Variables previstas:

```dotenv
DB_CLIENT=mysql2
MYSQL_HOST=REEMPLAZAR_HOST_INTERNO
MYSQL_PORT=3306
MYSQL_USER=copamoda
MYSQL_PASSWORD=REEMPLAZAR_EN_DOKPLOY
MYSQL_DATABASE=copamoda
```

No migrar solo cambiando variables en producción. Primero se debe:

1. Crear MySQL en Dokploy.
2. Configurar backups.
3. Probar migraciones en un entorno separado.
4. Exportar y transformar los datos SQLite.
5. Importar a MySQL.
6. Comparar cantidades y saldos.
7. Cambiar variables.
8. Desplegar y verificar.
9. Conservar el backup SQLite hasta confirmar estabilidad.

## 17. Imágenes y videos

La app actual no admite subida de archivos. No se debe guardar contenido
multimedia como Base64 dentro de SQLite.

Diseño recomendado:

- Almacenamiento compatible con S3, por ejemplo Cloudflare R2, Backblaze B2 o
  AWS S3.
- La base de datos guarda la clave, URL, tipo MIME, tamaño y propietario.
- Validar extensión, MIME y tamaño en el backend.
- Usar URLs firmadas para archivos privados.
- Comprimir imágenes a WebP o JPEG.
- Limitar inicialmente cada imagen a aproximadamente 5 MB.
- Evitar videos o imponer una cuota separada.
- Escanear archivos si los subirán usuarios externos.

Ejemplos de crecimiento:

- 1,000 imágenes de 5 MB consumen cerca de 5 GB.
- 100 videos de 100 MB consumen cerca de 10 GB.

El límite JSON actual de Express es 1 MB y no constituye un sistema de subida
de archivos. Los uploads futuros deben usar `multipart/form-data` o cargas
directas firmadas a S3.

## 18. Backups

Un volumen persistente no es un backup.

Configuración recomendada en Dokploy:

1. Crear un destino externo en `S3 Destinations`.
2. Abrir COPAMODA y entrar en `Volume Backups`.
3. Seleccionar `copamoda_data`.
4. Programar una copia diaria en horario de poca actividad.
5. Mantener copias diarias y semanales según el espacio contratado.
6. Probar una restauración en un entorno separado.
7. Documentar fecha, responsable y resultado de cada prueba de restauración.

Nunca guardar la única copia en el mismo VPS. Antes de migraciones, cambios de
volumen o actualizaciones importantes se debe generar una copia adicional.

## 19. Seguridad prioritaria

Estado actual: la app no tiene autenticación propia. Antes de guardar datos
personales reales se debe proteger.

Orden recomendado:

1. Activar autenticación básica temporal en `Advanced > Security` de Dokploy.
2. Implementar usuarios y roles dentro de COPAMODA.
3. Proteger el panel Dokploy con dominio HTTPS; no administrarlo habitualmente
   mediante HTTP público en el puerto 3000.
4. Activar 2FA en GitHub, Hostinger y cuentas administrativas.
5. Rotar el webhook de despliegue porque apareció visible en una captura.
6. Convertir el repositorio a privado si el código no debe ser público.
7. Configurar backups externos.
8. Revisar dependencias y logs.
9. Restringir CORS y añadir rate limiting.
10. No exponer Swagger públicamente cuando existan operaciones sensibles.

No guardar en Git:

- Contraseñas.
- Tokens de GitHub.
- Webhooks de Dokploy.
- Claves SSH privadas.
- Credenciales S3.
- Archivos `.env`.
- Copias de la base de datos.
- Datos personales exportados.

## 20. Plantilla para adaptar este despliegue

Copiar y completar esta sección en un proyecto nuevo:

```yaml
project_name: REEMPLAZAR
owner_github: REEMPLAZAR
owner_email: REEMPLAZAR
repository: https://github.com/OWNER/REPOSITORY
production_url: https://app.example.com
health_url: https://app.example.com/api/health
production_branch: main
hosting: Hostinger VPS
deployment_platform: Dokploy
build_type: Dockerfile
dockerfile_path: Dockerfile
docker_context_path: .
container_port: 3000
domain_path: /
internal_path: /
database: sqlite3
volume_name: PROJECT_data
data_mount: /app/data
database_file: /app/data/project.sqlite3
replicas: 1
auto_deploy: true
```

Variables genéricas:

```dotenv
NODE_ENV=production
PORT=3000
API_PREFIX=/api
DB_CLIENT=sqlite3
SQLITE_FILENAME=/app/data/project.sqlite3
```

Preguntas que el agente debe resolver antes de adaptar:

1. ¿Dónde escucha realmente el servidor?
2. ¿Cuál es el puerto interno?
3. ¿Cuál es la ruta de salud?
4. ¿Qué datos necesitan persistencia?
5. ¿La app sirve frontend y API juntas o separadas?
6. ¿Qué variables son de build y cuáles son de ejecución?
7. ¿Existe migración y seed seguros e idempotentes?
8. ¿El volumen se puede compartir o exige una sola réplica?
9. ¿Cómo se realizan y restauran backups?
10. ¿Qué autenticación protege los datos?
11. ¿Cuánto CPU, RAM y disco tiene el VPS?
12. ¿Qué ocurre cuando el despliegue falla?

No copiar ciegamente el puerto 3000, la ruta SQLite o el comando de inicio a
otro proyecto. Se deben leer su `Dockerfile`, scripts y documentación.

## 21. Checklist de producción

Antes de cada despliegue:

- [ ] `git status` revisado.
- [ ] Solo se incluyen cambios intencionales.
- [ ] No hay secretos en el diff.
- [ ] `npm run lint` aprobado.
- [ ] `npm test` aprobado.
- [ ] `npm run build` aprobado.
- [ ] Migraciones revisadas.
- [ ] Backup realizado si el cambio afecta datos.
- [ ] Volumen y variables sin cambios accidentales.

Después de cada despliegue:

- [ ] Dokploy muestra `Done`.
- [ ] El commit desplegado coincide con GitHub.
- [ ] `/api/health` responde correctamente.
- [ ] La página principal abre por HTTPS.
- [ ] Los datos anteriores siguen visibles.
- [ ] La función modificada fue probada.
- [ ] No hay errores nuevos en Logs.
- [ ] No se creó una réplica adicional con SQLite.

## 22. Recuperación rápida

Si una versión nueva falla:

1. No borrar el volumen.
2. Abrir `Deployments` y revisar el último log.
3. Confirmar el commit que se intentó desplegar.
4. Usar rollback de Dokploy a una imagen conocida si está configurado.
5. Si hubo una migración destructiva, restaurar desde backup siguiendo el plan
   probado; no improvisar sobre producción.
6. Verificar salud, datos y logs después de recuperar.

Un rollback del código no deshace automáticamente una migración de base de
datos. Por eso las migraciones y backups requieren revisión especial.

## 23. Fuente de verdad

- Código y configuración versionada: repositorio GitHub.
- Secretos y variables de producción: Dokploy.
- Datos: volumen `copamoda_data` del VPS.
- Backups: destino S3 externo cuando se configure.
- Configuración de infraestructura: este manual y el panel Dokploy.
- Contexto funcional: `COPAMODA_CONTEXT.md`.

Si la configuración real cambia, este documento debe actualizarse en el mismo
commit para que otra terminal o agente no trabaje con información obsoleta.
