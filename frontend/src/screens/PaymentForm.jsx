import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/Button";
import InputNumber from "../components/InputNumber";
import { usePayments } from "../hooks/usePayments";
import { apiError } from "../services/api";
export default function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { order, addPayment } = usePayments(id);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("efectivo");
  const balance = Number(order?.saldo || 0);
  async function submit(e) {
    e.preventDefault();
    if (Number(amount) <= 0 || Number(amount) > balance)
      return toast.error("El monto debe ser mayor a 0 y no superar el saldo.");
    try {
      const result = await addPayment({
        order_id: id,
        monto: Number(amount),
        metodo: method,
        fecha: new Date().toISOString(),
      });
      toast.success(
        result?.queued ? "Pago guardado sin conexión" : "Pago registrado",
      );
      navigate(`/pedidos/${id}`);
    } catch (e) {
      toast.error(apiError(e));
    }
  }
  return (
    <section>
      <Link to={`/pedidos/${id}`} className="back">
        ‹ Volver al pedido
      </Link>
      <p className="eyebrow">ABONO</p>
      <h1>Registrar pago</h1>
      <div className="balance-callout">
        <span>Saldo disponible</span>
        <strong>${balance.toFixed(2)}</strong>
      </div>
      <form onSubmit={submit} className="form-grid">
        <InputNumber
          label="Monto del abono"
          value={amount}
          onChange={setAmount}
          min="0.01"
        />
        <label className="field">
          <span>Método de pago</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>efectivo</option>
            <option>transferencia</option>
            <option>tarjeta</option>
          </select>
        </label>
        <Button type="submit" disabled={!balance}>
          Confirmar abono
        </Button>
      </form>
    </section>
  );
}
