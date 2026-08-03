import axios from "axios";
import { enqueueRequest } from "./offlineQueue";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

const unwrap = (response) => response.data?.data ?? response.data;
export async function request(method, url, data, config) {
  try {
    return unwrap(await api.request({ method, url, data, ...config }));
  } catch (error) {
    if (
      !navigator.onLine &&
      ["post", "put", "patch"].includes(method.toLowerCase())
    ) {
      await enqueueRequest({ method, url, data });
      return { queued: true, sync_status: "pending" };
    }
    throw error;
  }
}
export const apiError = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "No se pudo completar la operación";
