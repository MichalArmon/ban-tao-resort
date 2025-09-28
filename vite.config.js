import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // חשוב: שם הריפו המדויק
  base: "/ban-tao-resort/",
});
