import { useCallback, useEffect, useState } from "react";
import { request, apiError } from "../services/api";
import { toast } from "react-toastify";
// curl -X GET "$VITE_API_URL/measurements/CLIENTE_UUID"
// curl -X POST "$VITE_API_URL/measurements" -H "Content-Type: application/json" -d '{"cliente_id":"CLIENTE_UUID","scope":"superior","values":[]}'
export function useMeasurements(clientId) {
  const [data, setData] = useState({ records: [], definitions: [] });
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const result = await request("get", `/measurements/${clientId}`);
      const records = result?.records || [];
      const definitions = [
        ...new Map(
          records
            .flatMap((r) => r.values || [])
            .map((v) => [v.definition_id, v]),
        ).values(),
      ];
      setData({ ...result, records, definitions });
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [clientId]);
  useEffect(() => {
    load();
  }, [load]);
  const saveMeasurement = async (payload) => {
    const result = await request("post", "/measurements", payload);
    if (!result?.queued)
      setData((old) => ({ ...old, records: [result, ...old.records] }));
    return result;
  };
  return { ...data, loading, reload: load, saveMeasurement };
}
