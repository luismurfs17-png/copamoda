import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { useClients } from "../hooks/useClients";
import { apiError } from "../services/api";

export default function Clients() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("recent");
  const [modal, setModal] = useState(false);
  const { clients, loading, createClient } = useClients(q);
  const sorted = useMemo(
    () =>
      [...clients].sort((a, b) =>
        sort === "balance"
          ? (b.saldo || 0) - (a.saldo || 0)
          : new Date(b.created_at || 0) - new Date(a.created_at || 0),
      ),
    [clients, sort],
  );
  async function submit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const result = await createClient({
        nombre: form.get("nombre"),
        telefono: form.get("telefono"),
        direccion: form.get("direccion") || null,
      });
      toast.success(
        result?.queued ? "Guardado sin conexión" : "Cliente creado",
      );
      setModal(false);
    } catch (err) {
      toast.error(apiError(err));
    }
  }
  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DIRECTORIO</p>
          <h1>Clientes</h1>
          <p className="muted">Tu taller, más ordenado.</p>
        </div>
        <Button onClick={() => setModal(true)}>+ Nuevo cliente</Button>
      </div>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Buscar por nombre o teléfono"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Más recientes</option>
          <option value="balance">Mayor saldo</option>
        </select>
      </div>
      {loading ? (
        <p className="empty">Cargando clientes...</p>
      ) : (
        <div className="list">
          {sorted.map((client) => (
            <Link
              className="card client-card"
              to={`/clientes/${client.id}`}
              key={client.id}
            >
              <div className="avatar">{client.nombre?.[0]?.toUpperCase()}</div>
              <div className="grow">
                <strong>{client.nombre}</strong>
                <span className="muted">{client.telefono}</span>
              </div>
              <div
                className={
                  (client.saldo || 0) > 0 ? "amount debt" : "amount paid"
                }
              >
                {(client.saldo || 0) > 0
                  ? `$${Number(client.saldo).toFixed(2)}`
                  : "Al día"}
                <small>saldo</small>
              </div>
              <span className="arrow">›</span>
            </Link>
          ))}
          {!sorted.length && (
            <p className="empty">No hay clientes que coincidan.</p>
          )}
        </div>
      )}
      {modal && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={submit}>
            <div className="modal-title">
              <h2>Nuevo cliente</h2>
              <button className="close" onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <label className="field">
              <span>Nombre completo</span>
              <input name="nombre" required autoFocus />
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input
                name="telefono"
                type="tel"
                pattern="[0-9+ ()-]{7,}"
                autoComplete="tel"
                required
              />
            </label>
            <label className="field">
              <span>
                Dirección <small>(opcional)</small>
              </span>
              <input name="direccion" />
            </label>
            <Button type="submit">Guardar cliente</Button>
          </form>
        </div>
      )}
    </section>
  );
}
