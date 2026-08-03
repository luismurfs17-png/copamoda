FROM node:22-bookworm-slim AS deps

WORKDIR /app

ENV NODE_ENV=development

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY backend/package*.json backend/
COPY frontend/package*.json frontend/

# Vite necesita devDependencies y Rollup necesita su binario opcional para Linux.
# El lockfile del frontend contiene todas las variantes de plataforma.
RUN npm ci --include=dev \
  && npm ci --prefix frontend --include=dev --include=optional

FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build --workspace frontend

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY backend/package*.json backend/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend ./backend

VOLUME ["/app/backend/data"]

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate --workspace backend && npm run seed --workspace backend && npm start --workspace backend"]
