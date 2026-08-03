const KEY = "copamoda_offline_queue";
const read = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));
export function queuedItems() {
  return read();
}
export async function enqueueRequest(item) {
  write([
    ...read(),
    {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      sync_status: "pending",
    },
  ]);
}
export async function syncQueue(apiClient) {
  const items = read();
  const remaining = [];
  for (const item of items) {
    try {
      await apiClient.request({
        method: item.method,
        url: item.url,
        data: item.data,
      });
    } catch {
      remaining.push(item);
    }
  }
  write(remaining);
  return items.length - remaining.length;
}
export function installQueueSync(apiClient, onSynced) {
  const sync = async () => {
    if (navigator.onLine) {
      const count = await syncQueue(apiClient);
      if (count) onSynced?.(count);
    }
  };
  window.addEventListener("online", sync);
  sync();
  return () => window.removeEventListener("online", sync);
}
