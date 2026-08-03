import Button from "../components/Button";
import { queuedItems } from "../services/offlineQueue";
export default function Settings() {
  return (
    <section>
      <p className="eyebrow">SISTEMA</p>
      <h1>Ajustes</h1>
      <div className="card settings-list">
        <div>
          <strong>Conexión</strong>
          <span className={navigator.onLine ? "paid" : "debt"}>
            {navigator.onLine ? "En línea" : "Sin conexión"}
          </span>
        </div>
        <div>
          <strong>Sincronización pendiente</strong>
          <span>{queuedItems().length} formularios</span>
        </div>
        <div>
          <strong>Versión</strong>
          <span>1.0.0</span>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={() =>
          window.open(
            `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/docs`,
            "_blank",
            "noopener",
          )
        }
      >
        Abrir documentación Swagger
      </Button>
    </section>
  );
}
