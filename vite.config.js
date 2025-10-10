// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// הגדרה דינמית — שלושת התתי-אתרים חיים תחת אותו דומיין
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    mode === "gh"
      ? "/ban-tao/" // אם תפרסמי את כל הפרויקט ל-GH Pages
      : "/", // ב-Netlify או dev הכל תחת ban-tao.com/*
}));
