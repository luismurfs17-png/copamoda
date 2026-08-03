import { useCallback, useEffect, useState } from "react";
import { api, apiError, request } from "../services/api";
import { toast } from "react-toastify";
// curl -X GET "$VITE_API_URL/clientes?q=ana&includeArchived=false"
export function useClients(query = "") {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setClients(
        (await request("get", "/clientes", undefined, {
          params: { q: query.trim() || undefined, includeArchived: false },
        })) || [],
      );
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setLoading(false);
    }
  }, [query]);
  useEffect(() => {
    load();
  }, [load]);
  const createClient = async (data) => {
    const result = await request("post", "/clientes", data);
    if (!result?.queued) setClients((old) => [result, ...old]);
    return result;
  };
  const archiveClient = async (id) => {
    const result = await request("patch", `/clientes/${id}/archive`);
    setClients((old) => old.filter((c) => c.id !== id));
    return result;
  };
  return { clients, loading, reload: load, createClient, archiveClient };
}
