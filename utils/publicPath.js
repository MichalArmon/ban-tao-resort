// src/utils/publicPath.js
export const BASE = import.meta.env.BASE_URL; // תמיד מסתיים ב־'/'.
export const pub = (p = "") => `${BASE}${String(p).replace(/^\/+/, "")}`;
