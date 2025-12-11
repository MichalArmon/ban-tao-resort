// src/config/api.js
export const GLOBAL_API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1";

console.log("🌍 Using API base:", GLOBAL_API_BASE);

// פונקציית בקשה כללית
async function request(path, { method = "GET", body, headers } = {}) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
  };

  // מוסיפים את הגוף אם יש
  if (body !== undefined) {
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const res = await fetch(`${GLOBAL_API_BASE}${path}`, opts);
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  // אם לא תקין — זורקים שגיאה עם הודעה משמעותית
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// =============================================================
// פונקציות GET/POST/PUT/DELETE עם תמיכה ב-token
// =============================================================

// GET
export const get = (path, token) =>
  request(path, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// POST
export const post = (path, body, token) =>
  request(path, {
    method: "POST",
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// PUT
export const put = (path, body, token) =>
  request(path, {
    method: "PUT",
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

// DELETE
export const del = (path, token) =>
  request(path, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
