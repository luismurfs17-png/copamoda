---
name: deploy-dokploy-docker
description: Dokploy, Docker, VPS y GitHub deployment. Usar cuando se necesite publicar, migrar, diagnosticar o asegurar una aplicación contenerizada en Dokploy, especialmente al configurar Dockerfile, dominio, puertos, variables, volúmenes, bases de datos, backups y despliegues desde Git.
---

# Deploy Dokploy Docker

## Objetivo

Desplegar aplicaciones desde GitHub hacia Dokploy de forma reproducible,
segura y adaptable. No copiar parámetros de otro proyecto sin verificar el
código, el contenedor, la base de datos y el VPS de destino.

## Referencias

Leer según corresponda:

- `references/deployment-template.md`: plantilla genérica y checklist.
- `references/copamoda-example.md`: ejemplo verificado y errores reales.
- `DEPLOYMENT_RUNBOOK.md` en la raíz, si existe: fuente específica del proyecto.
- `README.md`, archivos de contexto y documentación del repositorio.

La referencia específica del proyecto prevalece sobre el ejemplo genérico.
Los secretos configurados en el panel prevalecen sobre cualquier ejemplo, pero
nunca deben copiarse a archivos versionados.

## Reglas críticas

1. No adivinar puerto, comando de inicio, ruta de build ni almacenamiento.
2. No guardar contraseñas, tokens, webhooks, claves privadas o `.env` en Git.
3. No borrar volúmenes ni ejecutar comandos destructivos para solucionar un
   despliegue.
4. No usar varias réplicas con un archivo SQLite compartido.
5. No montar `docker.sock` ni ejecutar en modo privilegiado salvo requisito
   explícito, justificado y aprobado.
6. No usar `npm audit fix --force`, force-push o rollback destructivo de forma
   automática.
7. Tratar `push`, `Deploy`, migraciones y cambios de volumen como operaciones de
   producción. Confirmar intención si el usuario no las solicitó claramente.
8. Preservar cambios ajenos en un worktree sucio.
9. Crear o verificar un backup antes de migraciones destructivas, cambios de
   base de datos o rutas de volumen.
10. Verificar una función real y los datos existentes, no solo un HTTP 200.

## Herramientas esperadas

Usar herramientas de lectura y búsqueda para inspeccionar el repositorio. Usar
terminal para Git, npm, Docker, curl y verificaciones. Usar fetch web para
comprobar documentación oficial y endpoints públicos. Pedir al usuario una
captura de Dokploy cuando un valor del panel no pueda verificarse desde código.

## Flujo obligatorio

### 1. Determinar el alcance

Identificar si la solicitud es:

- Primer despliegue.
- Actualización de una app existente.
- Diagnóstico de build.
- Diagnóstico de contenedor o `Bad Gateway`.
- Dominio y HTTPS.
- Persistencia o backup.
- Migración de base de datos.
- Seguridad o multiusuario.
- Adaptación del patrón a otro proyecto.

Confirmar si el destino es producción y si `main` tiene auto deploy.

### 2. Descubrir el proyecto

Inspeccionar como mínimo:

- `README*` y documentación de despliegue.
- `Dockerfile` y `.dockerignore`.
- `docker-compose*.yml`.
- `package.json` y lockfiles, o equivalentes del lenguaje.
- Scripts de build, start, migrate, seed y test.
- Configuración del servidor y dirección de escucha.
- Variables de entorno leídas por el código.
- Configuración del frontend para la URL de API.
- Migraciones, seeds y persistencia.
- Endpoint de salud.
- Estado Git, rama, remoto y commits recientes.

No modificar archivos hasta poder explicar cómo se construye, arranca y guarda
datos la aplicación.

### 3. Crear el manifiesto de despliegue

Completar la plantilla de `references/deployment-template.md` con valores
derivados del proyecto. Separar claramente:

- Variables de build.
- Variables de ejecución.
- Secretos.
- Puerto interno del contenedor.
- Puerto publicado, si realmente es necesario.
- Dominio, path e internal path.
- Ruta mutable que necesita volumen.
- Tipo de base de datos y número seguro de réplicas.
- Comando de migración y estrategia de rollback.

Presentar al usuario cualquier dato que no pueda inferirse.

### 4. Verificar localmente

Usar los comandos reales del proyecto. Para Node suelen incluir:

```bash
npm ci
npm run lint
npm test
npm run build
```

Si Docker está disponible:

```bash
docker build -t project:test .
```

Probar también migraciones y seed en una base temporal cuando cambie el flujo
de arranque. Un build frontend correcto no demuestra que el contenedor pueda
iniciar.

### 5. Revisar Docker

Comprobar:

- Imagen base soportada y con parches.
- Etapas de dependencias, build y producción.
- Lockfiles copiados antes de instalar.
- Dependencias de workspaces presentes en todas las etapas necesarias.
- Dependencias opcionales nativas resueltas para Linux.
- Solo artefactos necesarios en producción.
- `NODE_ENV` correcto en build y runtime.
- Puerto expuesto coincidente con la app.
- Proceso que recibe `SIGTERM` y se apaga limpiamente.
- Usuario no root cuando sea viable.
- Ausencia de secretos dentro de capas.
- Ausencia de datos persistentes dentro de la imagen.

### 6. Configurar Dokploy

Derivar y confirmar:

```yaml
provider: GitHub
repository: owner/repository
branch: main
build_type: Dockerfile
dockerfile_path: Dockerfile
docker_context_path: .
container_port: DERIVAR
domain_path: /
internal_path: /
https: true
```

Para acceso por dominio, Traefik normalmente usa el puerto interno. No crear un
puerto publicado solo por confundir 80, 443 y el puerto del contenedor.

Configurar un volumen nombrado para toda ruta mutable que deba sobrevivir a un
redespliegue. Confirmar el montaje antes de introducir datos reales.

### 7. Desplegar de forma controlada

Antes de commit o push:

1. Revisar `git status`.
2. Revisar diff y commits recientes.
3. Confirmar que no hay secretos.
4. Ejecutar verificaciones.
5. Incluir solo archivos intencionales.

Si existe auto deploy, un push puede ser suficiente. No iniciar despliegues
duplicados. Registrar el hash del commit esperado y comprobar que Dokploy usa
ese mismo hash.

### 8. Verificar producción

Comprobar en orden:

1. Despliegue marcado `Done` o equivalente.
2. Endpoint de salud.
3. Página por HTTPS.
4. API principal.
5. Datos existentes.
6. Función modificada.
7. Persistencia después de reinicio o redespliegue cuando aplique.
8. Logs sin errores repetitivos.
9. Certificado y ruta de dominio.
10. Consumo de CPU, memoria y disco.

No afirmar que todo está listo basándose solo en que el build terminó.

## Diagnóstico por capas

Seguir este orden para evitar cambios aleatorios:

1. Git: repositorio, rama y commit correctos.
2. Build: dependencias y compilación.
3. Imagen: archivos y comando de inicio.
4. Runtime: migraciones, base de datos y proceso.
5. Red interna: puerto y escucha.
6. Traefik: dominio, path, entrypoint y TLS.
7. Navegador: caché, service worker y versión desplegada.

Interpretación rápida:

- `Branch Not Match`: rama configurada incorrectamente.
- `vite: not found`: devDependencies ausentes o workspace no copiado.
- Módulo nativo de Rollup ausente: lockfile generado en otra plataforma o
  dependencias opcionales omitidas.
- Knex sin `client`: entorno de configuración no exportado.
- `404`: ruta o router incorrectos; no siempre es fallo del contenedor.
- `Bad Gateway`: Traefik no alcanza un proceso sano en el puerto interno.
- `No such container`: el build o arranque falló y no existe runtime activo.
- App vieja: service worker o caché del navegador.

Leer las últimas líneas útiles del log y encontrar la primera causa, no solo el
último mensaje genérico de Docker.

## Persistencia y bases de datos

### SQLite

Usar una sola réplica. Montar el directorio completo que contiene DB, WAL y
SHM. El volumen no es un backup. Mantener capacidad libre y programar respaldo
externo.

### MySQL o PostgreSQL

Usar para mayor concurrencia, múltiples réplicas o multiempresa. No migrar solo
cambiando variables. Probar exportación, importación, conteos, saldos, claves y
rollback en un entorno separado.

### Archivos multimedia

No almacenar imágenes o videos como Base64 en la base. Usar almacenamiento S3
compatible, validar MIME y tamaño, y guardar metadatos en la DB.

## Puerta de seguridad

Antes de datos reales comprobar:

- Autenticación o protección temporal externa.
- Autorización de todas las rutas mutables y sensibles.
- HTTPS para app y panel administrativo.
- Panel de Dokploy no expuesto por HTTP público.
- Webhooks rotados si se compartieron.
- 2FA para proveedor, Git y plataforma.
- CORS restringido.
- Rate limiting.
- Headers de seguridad.
- Swagger protegido.
- Dependencias auditadas y runtime soportado.
- Backups externos y restauración probada.
- Docker sin socket ni privilegios innecesarios.

No confundir repositorio privado con seguridad de la API.

## Adaptación a otro proyecto

Usar COPAMODA únicamente como ejemplo. Sustituir todos los valores del
manifiesto y comprobarlos contra el nuevo código. En particular no reutilizar
automáticamente:

- Puerto 3000.
- `/api`.
- Ruta `/app/backend/data`.
- SQLite.
- Comandos npm.
- Dominio.
- Nombre del volumen.
- Rama `main`.
- Node 22.

Si el nuevo proyecto carece de Dockerfile, crear el mínimo correcto después de
entender su build y runtime. Si ya existe uno, preferir una corrección pequeña.

## Informe final

Al terminar, informar:

- Qué se desplegó.
- Commit desplegado.
- Configuración relevante sin secretos.
- Verificaciones ejecutadas.
- Estado del endpoint de salud.
- Estado de datos y volumen.
- Riesgos o tareas pendientes.
- Si no se pudo probar Docker, backup, panel o rollback.

No declarar éxito si alguna verificación crítica quedó pendiente.
