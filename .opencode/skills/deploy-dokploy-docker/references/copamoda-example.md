# Ejemplo verificado: COPAMODA

Ejemplo real para aprender el patrón. No copiar valores sin adaptarlos.

## Identidad

```yaml
project_name: COPAMODA
owner_github: luismurfs17-png
owner_email: luismurfs17@gmail.com
repository: https://github.com/luismurfs17-png/copamoda
production_url: https://copamoda.copaapp.cloud
health_url: https://copamoda.copaapp.cloud/api/health
branch: main
hosting: Hostinger VPS
deployment_platform: Dokploy
```

El correo forma parte del ejemplo público. No copiarlo a otro proyecto.

## Stack

```yaml
runtime: Node 22
backend: Express 4 + Knex
frontend: React 18 + Vite
database: SQLite
build_type: Dockerfile
container_port: 3000
api_prefix: /api
replicas: 1
```

## Dokploy

```yaml
provider: GitHub
repository: copamoda
branch: main
build_path: /
trigger_type: On Push
dockerfile_path: Dockerfile
docker_context_path: .
container_port: 3000
domain_path: /
internal_path: /
https: true
entrypoint: websecure
```

Variables de ejecución:

```dotenv
NODE_ENV=production
PORT=3000
DB_CLIENT=sqlite3
SQLITE_FILENAME=/app/backend/data/copamoda.sqlite3
```

Argumento de build predeterminado:

```dotenv
VITE_API_URL=/api
```

Persistencia:

```yaml
mount_type: Volume Mount
volume_name: copamoda_data
mount_path: /app/backend/data
database_file: /app/backend/data/copamoda.sqlite3
```

## Arranque

El contenedor ejecuta:

1. Migraciones Knex.
2. Seed idempotente de definiciones de medidas.
3. Servidor Express.

El frontend se compila en `backend/public` y Express sirve frontend y API desde
el mismo dominio.

## Errores reales resueltos

### Repositorio vacío

Se solucionó con commit y push a `main`.

### `Branch Not Match`

Dokploy debía usar `main`.

### `vite: not found`

Vite estaba dentro de `frontend/node_modules`. Docker debía copiar las
dependencias anidadas del workspace.

### Rollup Linux ausente

El lockfile raíz generado en Windows no incluía correctamente la dependencia
opcional nativa. Se instaló el frontend desde su propio lockfile:

```dockerfile
RUN npm ci --include=dev \
  && npm ci --prefix frontend --include=dev --include=optional
```

### Knex sin configuración de producción

`NODE_ENV=production` necesitaba una configuración `production` exportada por
`backend/knexfile.js`.

### `Bad Gateway`

Traefik funcionaba, pero el proceso se detenía durante migraciones. Se revisó
el log de runtime, no solo el log de build.

### Validación al abrir clientes

El frontend enviaba un filtro `q` vacío. Se omitió el parámetro cuando no había
búsqueda.

### Ruta de medidas con `demo`

La navegación contenía una ruta temporal. Se creó `/medidas`, se selecciona un
cliente real y el backend devuelve las definiciones aunque no exista historial.

### Caché PWA

Se cambió GET a `NetworkFirst`, se versionó la caché y se activaron
`skipWaiting` y `clientsClaim`.

## Verificaciones realizadas

- Build frontend.
- ESLint.
- Siete pruebas API.
- Migraciones en producción.
- Seed repetido sin duplicados.
- Health endpoint.
- Cliente persistente después de redespliegues.
- Definiciones de medidas.
- Actualización de Node 18 a Node 22.

## Límites y riesgos pendientes

- Sin autenticación propia.
- API pública si no se habilita protección externa.
- Panel Dokploy debe usar HTTPS y no quedar en HTTP público.
- Webhook debe rotarse si aparece en una captura.
- SQLite requiere una sola réplica.
- Backups externos pendientes de configuración y prueba.
- Sin uploads; usar S3 para imágenes o videos.
- Dependencias requieren revisión de auditoría.

## Fuente completa

En el repositorio COPAMODA, leer `DEPLOYMENT_RUNBOOK.md` para el historial,
operación, seguridad, capacidad, multiusuario, backups y adaptación completa.
