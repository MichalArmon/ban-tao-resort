// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // אל תשתמשי ב-&&; תמיד מחרוזת:
  base:
    mode === "gh"
      ? "/ban-tao-resort/" // לבילד GH Pages
      : mode === "netlify"
      ? "/resort/" // לבילד ל-Netlify (האתר תחת /resort)
      : "/", // dev / preview
}));
