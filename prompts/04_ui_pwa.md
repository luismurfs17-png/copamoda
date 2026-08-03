Actúa como un desarrollador Frontend senior especializado en PWAs mobile-first con React + Vite + Workbox.

Necesito que generes **todo** el código de la interfaz para la app COPAMODA, consumiendo el backend REST ya existente en /backend (Swagger disponible en /docs).

────────────────────────────────────────
REQUISITOS GENERALES
────────────────────────────────────────
• 100 % responsive, uso con pulgar (botones grandes).  
• Inputs numéricos deben abrir teclado numérico.  
• Colores de estado: verde = pagado / terminado, amarillo = en proceso, rojo = pendiente / deuda.  
• PWA instalable: manifiesto, service-worker con Workbox (cache first para GET, network first para POST/PUT).  
• Guardar formularios en localStorage si no hay conexión y sincronizar al volver el internet (`sync_status`).  
• Toast de éxito / error con `react-toastify`.  
• Autocompletar teléfono (pattern `tel`).  
• Código limpio, componentes reutilizables, hooks.

────────────────────────────────────────
ESTRUCTURA DE CARPETAS A ENTREGAR
────────────────────────────────────────
/frontend
  /public
    icon.png
    manifest.json
  /src
    /assets
    /components
      Button.jsx
      InputNumber.jsx
      ToastProvider.jsx
    /screens
      Clients.jsx
      ClientDetail.jsx
      MeasurementForm.jsx
      OrderForm.jsx
      OrderDetail.jsx
      PaymentForm.jsx
      Settings.jsx
    /hooks
      useClients.js
      useMeasurements.js
      useOrders.js
      usePayments.js
    /services
      api.js              ← Axios con baseURL desde .env
      offlineQueue.js     ← cola para requests offline
    /routes
      AppRoutes.jsx       ← React-Router v6
    App.jsx
    main.jsx
  .env.example            ← VITE_API_URL=http://localhost:3000
  package.json             ← react, react-router, axios, workbox, toastify
  vite.config.js
  README.md               ← instrucciones dev/prod

────────────────────────────────────────
PANTALLAS Y FUNCIONALIDAD
────────────────────────────────────────
1. **Clients.jsx**  
   - Lista de clientes con búsqueda y orden (saldo, antigüedad).  
   - Botón “Nuevo cliente” (modal).

2. **ClientDetail.jsx**  
   - Tabs (Datos, Medidas, Pedidos, Pagos).  
   - Acción “Archivar” → PATCH /clientes/:id/archive.

3. **MeasurementForm.jsx**  
   - Selector superior / inferior.  
   - Campos renderizados dinámicamente según `measurement_definitions` (ordenados por `display_order`).  
   - Guardar histórico.

4. **OrderForm.jsx / OrderDetail.jsx**  
   - Crear pedido (selecciona medidas existentes), calcula saldo.  
   - Mostrar estado y saldo en tiempo real.

5. **PaymentForm.jsx**  
   - Valida que el monto ≤ saldo.  
   - Actualiza lista de pagos.

6. **Settings.jsx**  
   - Botón para abrir `/docs` (Swagger) en navegador.  
   - Versión de la app.

────────────────────────────────────────
ENTREGABLE
────────────────────────────────────────
1. **Todos los archivos listados** con código completo y comentado.  
2. Service worker con Workbox (`workbox-sw`) listo para `npm run build`.  
3. Manifest con nombre, descripción, icono y background.  
4. Ejemplos `curl` en comentarios de cada hook (`useClients`, …).  
5. Scripts en `package.json`:  
   • `dev` → `vite`  
   • `build` → `vite build`  
   • `serve` → `vite preview`  

No incluyas nada del backend en estos archivos.  
Genera el código **listo para copiar y pegar** en las rutas indicadas.  
Si modificas un archivo existente explica con `// <= updated`.  
Mantén los nombres de carpetas exactamente como arriba.
