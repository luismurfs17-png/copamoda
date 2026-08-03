# COPAMODA Context

Archivo de referencia rápida del proyecto COPAMODA.

## Propósito

PWA para gestionar:

- Clientes
- Medidas históricas
- Pedidos
- Pagos/abonos

Está pensada para uso mobile-first, con soporte offline y sincronización al reconectar.

## Stack

- Backend: Node 22, Express 4, Knex, SQLite por defecto, MySQL opcional
- Frontend: React 18, Vite, Tailwind CSS, React Router 6
- UI: Lucide-React, Framer Motion, react-toastify
- PWA: manifest + service worker + Workbox
- QA: Jest + Supertest

## URLs locales

- Frontend local: `http://localhost:5173`
- API local: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Estructura importante

- `/backend`
  - `server.js` arranque
  - `app.js` Express, rutas, docs, static build
  - `config/` conexión a BD
  - `controllers/`, `routes/`, `services/`, `models/`
  - `validators/` validaciones
  - `migrations/`, `seeds/` datos y schema
  - `tests/` pruebas API
  - `utils/` helpers (uuid, date, order number)
- `/frontend`
  - `src/` app React
  - `public/` manifest, iconos, `sw.js`
  - `tailwind.config.js`, `postcss.config.js`, `vite.config.js`

## Reglas de negocio

- Los clientes no se borran físicamente, se archivan con `archived_at`.
- Las medidas son históricas. Si cambia algo, se crea un nuevo registro.
- Cada pago debe ser `> 0` y nunca puede superar el saldo.
- Los UUID se pueden mandar desde el cliente.
- `order_number` es incremental y visible.
- Las medidas se muestran en el orden de `display_order`.
- Las abreviaturas visibles vienen de `measurement_definitions.abbreviation`.
- Offline: si no hay conexión, el formulario se guarda en `localStorage` y se reintenta al volver online.

## Comandos

```bash
npm install
npm run dev
npm run test
npm run migrate
npm run seed
npm run build
npm run format
```

## Qué hace cada comando

- `npm run dev`: levanta backend y frontend en paralelo.
- `npm run test`: ejecuta Jest del backend.
- `npm run migrate`: aplica migraciones de base de datos.
- `npm run seed`: carga definiciones iniciales de medidas.
- `npm run build`: compila el frontend y lo deja en `backend/public`.
- `npm run format`: Prettier + ESLint fix.

## Variables de entorno

Archivo base: `.env.example`

Variables comunes:

- `PORT=3000`
- `API_PREFIX=/api`
- `DB_CLIENT=sqlite3`
- `SQLITE_FILENAME=./backend/data/copamoda.sqlite3`
- `VITE_API_URL=http://localhost:3000/api`

MySQL opcional:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

## Flujo de arranque recomendado

```bash
npm install
copy .env.example .env
npm run migrate
npm run seed
npm run dev
```

## Producción / Hostinger

1. Instalar dependencias con `npm install`.
2. Ejecutar `npm run migrate`.
3. Ejecutar `npm run seed`.
4. Ejecutar `npm run build`.
5. Iniciar backend con `npm start --workspace backend`.

El build del frontend queda servido por Express desde `backend/public`.

## API principal

- `GET /api/health`
- `GET/POST /api/clientes`
- `PUT/PATCH /api/clientes/:id`
- `POST /api/measurements`
- `GET /api/measurements/:clienteId`
- `GET/POST /api/orders`
- `PUT /api/orders/:id`
- `GET /api/payments/:orderId`
- `POST /api/payments`

## Notas de UI

- Estilo mobile-first con botones grandes.
- La navegación inferior es fija.
- En forms largos, dejar padding inferior suficiente para que no tape el botón.
- El estado visual usa colores:
  - verde: pagado / terminado
  - amarillo: en proceso
  - rojo: pendiente / deuda

## Observaciones útiles

- El backend actual ya trae pruebas y migraciones funcionales.
- El contrato público esperado es `/api`.
- No subir `node_modules` ni `.env` al repositorio.
