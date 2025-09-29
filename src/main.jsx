// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes.jsx";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme.js";
import { CacheProvider } from "@emotion/react";
import { AuthProvider } from "./auth.jsx";
import rtlCache from "./rtlCache.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
