import {
  installQueueSync,
  queuedItems,
  syncQueue,
} from "../services/offlineQueue";
import { api } from "../services/api";

export function useOfflineQueue() {
  return {
    pending: queuedItems(),
    sync: () => syncQueue(api),
    install: (onSynced) => installQueueSync(api, onSynced),
  };
}
