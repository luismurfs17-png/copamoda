# COPAMODA frontend

## Desarrollo

```bash
npm install
copy .env.example .env
npm run dev
```

`VITE_API_URL` apunta al backend REST. La documentación se abre desde Ajustes en `/docs`.

## Producción

```bash
npm run build
npm run serve
```

La identidad visual usa Tailwind CSS con `tailwind.config.js` y PostCSS (`postcss.config.js`). Para inicializar una instalación desde cero también puedes ejecutar:

```bash
npm install
npx tailwindcss init -p
npm run dev
npm run build # genera /dist listo para Hostinger
```

El formato está disponible con `npm run format`.

El build copia `public/sw.js` y `manifest.json`. El service worker usa Workbox: cache-first para GET y network-first con Background Sync para POST, PUT y PATCH. Los formularios que fallan sin conexión también se conservan en `localStorage` y se reintentan al dispararse `online`.

El backend actual no publica `measurement_definitions`; para mostrar campos nuevos, configura `VITE_MEASUREMENT_DEFINITIONS` con sus UUID reales o expón ese recurso en el API.
