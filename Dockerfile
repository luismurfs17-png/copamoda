FROM node:18-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

# Vite y las demas herramientas de compilacion son devDependencies.
# Deben instalarse aunque el despliegue final use NODE_ENV=production.
RUN npm ci --include=dev

FROM node:18-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build --workspace frontend

FROM node:18-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY backend/package*.json backend/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/backend ./backend

VOLUME ["/app/backend/data"]

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate --workspace backend && npm run seed --workspace backend && npm start --workspace backend"]
