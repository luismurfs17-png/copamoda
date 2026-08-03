# COPAMODA

PWA para gestionar clientes, medidas históricas, pedidos y abonos de un taller de confección. El monorepo contiene un backend Express/Knex y un frontend React/Vite/Tailwind.

Manual completo de despliegue, operación, límites y adaptación: [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md).

## Enlaces locales

- **Frontend local:** <http://localhost:5173>
- **API local:** <http://localhost:3000/api>
- Swagger: <http://localhost:3000/api/docs>

## Requisitos

Node.js 22 o superior. SQLite es la base de datos por defecto; MySQL se puede activar con las variables `MYSQL_*`.

## Desarrollo

```bash
npm install
copy .env.example .env
npm run migrate
npm run seed
npm run dev
```

Abre <http://localhost:5173>. El script `dev` arranca el backend en el puerto 3000 y Vite en el puerto 5173.

En macOS/Linux sustituye `copy .env.example .env` por `cp .env.example .env`.

## Calidad y build

```bash
npm run test
npm run format
npm run build
```

`npm run build` genera el frontend compilado en `backend/public`, que Express sirve en producción. El service worker y el manifest se copian automáticamente.

## Reglas de negocio

- Los clientes se archivan con `archived_at`; nunca se eliminan físicamente.
- Cada registro de medidas es histórico. Las correcciones crean otro `measurement_record`.
- Los pagos se validan como positivos y nunca pueden superar el saldo.
- Los UUID se aceptan desde el cliente para soportar operaciones offline.
- Los pedidos reciben números incrementales con formato `AAAA-0001`.
- Las definiciones de medida se ordenan por `display_order` y muestran `abbreviation`.
- Los formularios mutantes offline se conservan en `localStorage` y se reintentan al recuperar la conexión.

## Despliegue en Hostinger

1. Ejecuta `npm ci` y `npm run build` en un entorno Node 22.
2. Configura el proceso Node para ejecutar `npm start --workspace backend` y define `NODE_ENV=production`.
3. Configura las variables de base de datos y `PORT` en el panel de Hostinger.
4. Apunta el dominio al proceso Node. Express servirá la SPA y sus assets desde `backend/public`.

Para una instalación frontend estática, publica el contenido de `backend/public` y configura fallback de rutas a `index.html`; la API debe mantenerse en un proceso Node separado.

## Despliegue con Docker

1. En el VPS instala Docker y Docker Compose.
2. Clona el repo y crea un `.env` si quieres cambiar `PORT` o `SQLITE_FILENAME`.
3. Levanta todo con `docker compose up -d --build`.
4. La API queda en `http://TU_IP:3000/api` y la PWA en `http://TU_IP:3000`.
5. La base SQLite queda persistida en el volumen `copamoda_data`.

Si prefieres MySQL, cambia `DB_CLIENT=mysql2` y completa `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_DATABASE` antes de arrancar.
