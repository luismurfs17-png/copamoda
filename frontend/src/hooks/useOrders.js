import { useCallback, useEffect, useState } from "react";
import { request, apiError } from "../services/api";
import { toast } from "react-toastify";
// curl -X GET "$VITE_API_URL/orders?clienteId=CLIENTE_UUID"
// curl -X POST "$VITE_API_URL/orders" -H "Content-Type: application/json" -d '{"cliente_id":"CLIENTE_UUID","tipo_prenda":"Vestido","precio_total":100}'
export function useOrders(filters = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(
        (await request("get", "/orders", undefined, { params: filters })) || [],
      );
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);
  useEffect(() => {
    load();
  }, [load]);
  const createOrder = async (payload) => {
    const result = await request("post", "/orders", payload);
    if (!result?.queued) setOrders((old) => [result, ...old]);
    return result;
  };
  const updateStatus = async (id, estado) => {
    const result = await request("put", `/orders/${id}`, { estado });
    setOrders((old) => old.map((o) => (o.id === id ? result : o)));
    return result;
  };
  return { orders, loading, reload: load, createOrder, updateStatus };
}
