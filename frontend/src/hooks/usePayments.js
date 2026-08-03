import { useCallback, useEffect, useState } from "react";
import { request, apiError } from "../services/api";
import { toast } from "react-toastify";
// curl -X GET "$VITE_API_URL/payments/PEDIDO_UUID"
// curl -X POST "$VITE_API_URL/payments" -H "Content-Type: application/json" -d '{"order_id":"PEDIDO_UUID","monto":50,"metodo":"efectivo"}'
export function usePayments(orderId) {
  const [data, setData] = useState({
    payments: [],
    total_paid: 0,
    order: null,
  });
  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      setData(await request("get", `/payments/${orderId}`));
    } catch (e) {
      toast.error(apiError(e));
    }
  }, [orderId]);
  useEffect(() => {
    load();
  }, [load]);
  const addPayment = async (payload) => {
    const result = await request("post", "/payments", payload);
    if (!result?.queued) await load();
    return result;
  };
  return { ...data, reload: load, addPayment };
}
