import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import InputNumber from "../components/InputNumber";
import { useOrders } from "../hooks/useOrders";
import { apiError } from "../services/api";
export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createOrder } = useOrders({});
  const [total, setTotal] = useState("");
  const [garment, setGarment] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      const form = new FormData(e.currentTarget);
      const result = await createOrder({
        cliente_id: id,
        tipo_prenda: garment,
        descripcion: form.get("descripcion") || null,
        fecha_entrega: form.get("fecha_entrega")
          ? new Date(`${form.get("fecha_entrega")}T12:00:00`).toISOString()
          : undefined,
        precio_total: Number(total),
      });
      toast.success(
        result?.queued ? "Pedido guardado sin conexión" : "Pedido creado",
      );
      if (result?.id) navigate(`/pedidos/${result.id}`);
      else navigate(`/clientes/${id}`);
    } catch (e) {
      toast.error(apiError(e));
    }
  }
  return (
    <section>
      <Link to={`/clientes/${id}`} className="back">
        ‹ Volver al cliente
      </Link>
      <p className="eyebrow">NUEVO PEDIDO</p>
      <h1>Crear pedido</h1>
      <form onSubmit={submit} className="form-grid">
        <label className="field">
          <span>Tipo de prenda</span>
          <input
            value={garment}
            onChange={(e) => setGarment(e.target.value)}
            placeholder="Ej. Vestido de gala"
            required
          />
        </label>
        <label className="field">
          <span>Descripción</span>
          <textarea name="descripcion" rows="3" />
        </label>
        <label className="field">
          <span>Fecha de entrega</span>
          <input name="fecha_entrega" type="date" />
        </label>
        <InputNumber
          label="Precio total"
          value={total}
          onChange={setTotal}
          min="0.01"
        />
        <div className="total-preview">
          <span>Saldo inicial</span>
          <strong>${Number(total || 0).toFixed(2)}</strong>
        </div>
        <Button type="submit">Crear pedido</Button>
      </form>
    </section>
  );
}
