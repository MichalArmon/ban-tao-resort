// src/config/api.js
export const GLOBAL_API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://resort-server-kzy9.onrender.com/api/v1";

async function request(path, opts) {
  const res = await fetch(`${GLOBAL_API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const get = (path) => request(path);
export const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });
