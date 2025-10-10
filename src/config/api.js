// src/config/api.js
export const GLOBAL_API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://resort-server-kzy9.onrender.com/api/v1";

async function request(path, { method = "GET", body, headers } = {}) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
  };
  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(`${GLOBAL_API_BASE}${path}`, opts);

  // תומך גם ב-204 וגם בגוף טקסטואלי
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && data.message) || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const get = (path) => request(path, { method: "GET" });
export const post = (path, body) => request(path, { method: "POST", body });
export const put = (path, body) => request(path, { method: "PUT", body });
export const del = (path) => request(path, { method: "DELETE" });
