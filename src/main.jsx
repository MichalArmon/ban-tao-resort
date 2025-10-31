// 📁 src/main.jsx
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
import { RetreatsProvider } from "./context/RetreatsContext.jsx";
import { WorkshopsProvider } from "./context/WorkshopsContext.jsx"; // ✅ חדש
import { TreatmentsProvider } from "./context/TreatmentsContext.jsx";
import { ScheduleProvider } from "./context/ScheduleContext.jsx";
import { RecurringRulesProvider } from "./context/RecurringRulesContext.jsx";

// 📁 src/main.jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
            {/* 🩵 כל ה־Providers שלך צריכים לעטוף כאן */}
            <UploadProvider>
              <TreatmentsProvider>
                <RoomsProvider>
                  <RetreatsProvider>
                    <WorkshopsProvider>
                      <BookingProvider>
                        <RecurringRulesProvider>
                          <ScheduleProvider>
                            <AppRoutes /> {/* 👈 עכשיו הכל עטוף! */}
                          </ScheduleProvider>
                        </RecurringRulesProvider>
                      </BookingProvider>
                    </WorkshopsProvider>
                  </RetreatsProvider>
                </RoomsProvider>
              </TreatmentsProvider>
            </UploadProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
