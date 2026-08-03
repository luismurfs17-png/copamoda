import { api, apiError, request } from "../services/api";

// Small shared API hook for pages that need a one-off REST request.
export function useApi() {
  return { api, request, apiError };
}
