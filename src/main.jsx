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
import { BookingProvider } from "./context/BookingContext";
import { RoomsProvider } from "./context/RoomContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <UploadProvider>
        <RoomsProvider>
          <BookingProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AuthProvider>
                <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
                  <AppRoutes />
                </BrowserRouter>
              </AuthProvider>
            </ThemeProvider>
          </BookingProvider>
        </RoomsProvider>
      </UploadProvider>
    </CacheProvider>
  </React.StrictMode>
);
