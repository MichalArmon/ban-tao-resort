// src/utils/publicPath.js
const normalize = (s) => (s.endsWith("/") ? s : s + "/");

const safeBase = () => {
  const b = import.meta?.env?.BASE_URL;
  // אם ב־dev/בילד בטעות נקבע "/false" או undefined – נשתמש ב־"/"
  if (!b || b === "/false") return "/";
  return normalize(b);
};

export const BASE = safeBase(); // תמיד יסתיים ב־"/"
export const pub = (p = "") => BASE + String(p).replace(/^\/+/, "");
