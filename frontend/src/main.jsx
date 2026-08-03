import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { api } from "./services/api";
import { installQueueSync } from "./services/offlineQueue";
import App from "./App";
import "./index.css";
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js").catch(() => {}),
  );
installQueueSync(api, (count) =>
  window.dispatchEvent(new CustomEvent("copamoda:sync", { detail: count })),
);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
