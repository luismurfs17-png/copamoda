import { Link } from "react-router-dom";
import { useClients } from "../hooks/useClients";

export default function Measurements() {
  const { clients, loading } = useClients();

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MEDIDAS</p>
          <h1>Selecciona un cliente</h1>
          <p className="muted">Elige para registrar nuevas medidas.</p>
        </div>
      </div>

      {loading ? (
        <p className="empty">Cargando clientes...</p>
      ) : (
        <div className="list">
          {clients.map((client) => (
            <Link
              className="card client-card"
              to={`/clientes/${client.id}/medidas/nueva`}
              key={client.id}
            >
              <div className="avatar">{client.nombre?.[0]?.toUpperCase()}</div>
              <div className="grow">
                <strong>{client.nombre}</strong>
                <span className="muted">Registrar nuevas medidas</span>
              </div>
              <span className="arrow">›</span>
            </Link>
          ))}
          {!clients.length && (
            <p className="empty">Primero debes crear un cliente.</p>
          )}
        </div>
      )}
    </section>
  );
}
