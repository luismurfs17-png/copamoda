import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { useClients } from "../hooks/useClients";
import { useMeasurements } from "../hooks/useMeasurements";
import { useOrders } from "../hooks/useOrders";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, archiveClient } = useClients();
  const client = clients.find((c) => c.id === id);
  const [tab, setTab] = useState("datos");
  const measurements = useMeasurements(id);
  const { orders } = useOrders({ clienteId: id });
  async function archive() {
    if (window.confirm("¿Archivar este cliente?")) {
      await archiveClient(id);
      toast.success("Cliente archivado");
      navigate("/");
    }
  }
  if (!client)
    return (
      <section>
        <Link to="/" className="back">
          ‹ Clientes
        </Link>
        <p className="empty">Cliente no encontrado o cargando...</p>
      </section>
    );
  return (
    <section>
      <Link to="/" className="back">
        ‹ Clientes
      </Link>
      <div className="profile">
        <div className="avatar avatar-large">{client.nombre[0]}</div>
        <div>
          <p className="eyebrow">CLIENTE</p>
          <h1>{client.nombre}</h1>
          <a className="muted" href={`tel:${client.telefono}`}>
            {client.telefono}
          </a>
        </div>
        <Button variant="danger" onClick={archive}>
          Archivar
        </Button>
      </div>
      <Link
        className="button button-primary full"
        to={`/clientes/${id}/pedido/nuevo`}
      >
        + Crear pedido
      </Link>
      <nav className="tabs">
        {[
          ["datos", "Datos"],
          ["medidas", "Medidas"],
          ["pedidos", "Pedidos"],
          ["pagos", "Pagos"],
        ].map(([key, label]) => (
          <button
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "datos" && (
        <div className="card detail-info">
          <p>
            <span className="muted">Dirección</span>
            <strong>{client.direccion || "Sin dirección"}</strong>
          </p>
          <p>
            <span className="muted">Saldo pendiente</span>
            <strong className="debt">
              ${Number(client.saldo || 0).toFixed(2)}
            </strong>
          </p>
        </div>
      )}
      {tab === "medidas" && (
        <>
          <Link
            className="button button-primary full"
            to={`/clientes/${id}/medidas/nueva`}
          >
            + Registrar medidas
          </Link>
          {measurements.records.map((r) => (
            <div className="card history" key={r.id}>
              <strong>
                {r.scope === "superior" ? "Parte superior" : "Parte inferior"}
              </strong>
              <span className="muted">
                {new Date(r.fecha).toLocaleDateString()}
              </span>
            </div>
          ))}
        </>
      )}
      {tab === "pedidos" && (
        <>
          {orders.map((o) => (
            <Link className="card history" to={`/pedidos/${o.id}`} key={o.id}>
              <strong>
                {o.order_number} · {o.tipo_prenda}
              </strong>
              <span className={`status status-${o.estado}`}>{o.estado}</span>
            </Link>
          ))}
        </>
      )}
      {tab === "pagos" && (
        <div className="card">
          <p className="muted">Los pagos se gestionan desde cada pedido.</p>
          {orders.map((o) => (
            <Link className="history" to={`/pedidos/${o.id}`} key={o.id}>
              <strong>{o.order_number}</strong>
              <span>${Number(o.pagado || 0).toFixed(2)} pagado</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
