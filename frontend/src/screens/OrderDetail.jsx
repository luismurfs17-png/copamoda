import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { useOrders } from "../hooks/useOrders";
import { usePayments } from "../hooks/usePayments";
export default function OrderDetail() {
  const { id } = useParams();
  const { orders, updateStatus } = useOrders({});
  const order = orders.find((o) => o.id === id);
  const payments = usePayments(id);
  if (!order)
    return (
      <section>
        <Link to="/" className="back">
          ‹ Inicio
        </Link>
        <p className="empty">Pedido no encontrado o cargando...</p>
      </section>
    );
  async function change(e) {
    try {
      await updateStatus(id, e.target.value);
      toast.success("Estado actualizado");
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  }
  return (
    <section>
      <Link to={`/clientes/${order.cliente_id}`} className="back">
        ‹ {order.cliente?.nombre || "Cliente"}
      </Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{order.order_number}</p>
          <h1>{order.tipo_prenda}</h1>
          <p className="muted">{order.descripcion}</p>
        </div>
        <span className={`status status-${order.estado}`}>{order.estado}</span>
      </div>
      <div className="stats">
        <div>
          <span>Total</span>
          <strong>${Number(order.precio_total).toFixed(2)}</strong>
        </div>
        <div>
          <span>Pagado</span>
          <strong className="paid">
            ${Number(order.pagado || payments.total_paid || 0).toFixed(2)}
          </strong>
        </div>
        <div>
          <span>Saldo</span>
          <strong className={Number(order.saldo) ? "debt" : "paid"}>
            ${Number(order.saldo).toFixed(2)}
          </strong>
        </div>
      </div>
      <label className="field">
        <span>Actualizar estado</span>
        <select value={order.estado} onChange={change}>
          <option value="pendiente">Pendiente</option>
          <option value="proceso">En proceso</option>
          <option value="terminado">Terminado</option>
          <option value="entregado">Entregado</option>
        </select>
      </label>
      <Link className="button button-primary full" to={`/pedidos/${id}/pago`}>
        + Registrar pago
      </Link>
      <h2 className="subheading">Pagos registrados</h2>
      {payments.payments.map((p) => (
        <div className="card history" key={p.id}>
          <strong className="paid">+${Number(p.monto).toFixed(2)}</strong>
          <span className="muted">
            {p.metodo} · {new Date(p.fecha).toLocaleDateString()}
          </span>
        </div>
      ))}
    </section>
  );
}
