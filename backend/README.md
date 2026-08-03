# Copamoda Backend

## Desarrollo

```bash
cd backend
copy .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

SQLite se usa por defecto en `backend/data/copamoda.sqlite3`. Para MySQL, configura en `.env`:

```env
DB_CLIENT=mysql2
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DATABASE=copamoda
```

Comandos disponibles:

- `npm run migrate`: aplica migraciones Knex.
- `npm run migrate:rollback`: revierte el último lote.
- `npm run seed`: carga definiciones de medidas.
- `npm run dev`: inicia con Nodemon.
- `npm test`: ejecuta Jest y Supertest.

Documentación interactiva: `http://localhost:3000/docs`.

## Logs

En desarrollo se muestra Morgan en consola. En producción se usa Pino y se escribe un archivo diario en `backend/logs/YYYY-MM-DD.log`.

Ejemplo de línea JSON:

```json
{"level":30,"time":1784486400000,"pid":1234,"hostname":"workstation","port":3000,"msg":"api_started"}
```

## Tests

Los tests usan una base SQLite aislada, ejecutan migraciones y seed antes de las pruebas y cierran la conexión al finalizar.
