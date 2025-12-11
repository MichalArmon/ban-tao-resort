// 📁 src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes.jsx";

import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme.js";
import { CacheProvider } from "@emotion/react";
import rtlCache from "./rtlCache.js";

import "./index.css";

// Providers
import { BirthChartProvider } from "./context/BirthChartContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import { BookingProvider } from "./context/BookingContext";
import { RoomsProvider } from "./context/RoomContext.jsx";
import { UploadProvider } from "./context/UploadContext.jsx";
import { RetreatsProvider } from "./context/RetreatsContext.jsx";
import { WorkshopsProvider } from "./context/WorkshopsContext.jsx";
import { TreatmentsProvider } from "./context/TreatmentsContext.jsx";
import { RecurringRulesProvider } from "./context/RecurringRulesContext.jsx";
import { CategoriesProvider } from "./context/CategoriesContext.jsx";
import { SessionsProvider } from "./context/SessionsContext.jsx";
import { DateSelectionProvider } from "./context/DateSelectionContext.jsx";
import ScrollToTop from "./components/common/ScrollToTop";

// ⭐ ה־Provider החדש של טיפולים
import { TreatmentSessionsProvider } from "./context/TreatmentSessionsContext.jsx";
import FloatingBirthChartButton from "./components/FloatingBirthChartButton.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <BirthChartProvider>
          <UserProvider>
            <FavoritesProvider>
              <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
                <CategoriesProvider>
                  <UploadProvider>
                    <TreatmentsProvider>
                      <BookingProvider>
                        <DateSelectionProvider>
                          <RoomsProvider>
                            <RetreatsProvider>
                              <WorkshopsProvider>
                                <RecurringRulesProvider>
                                  <SessionsProvider>
                                    {/* ⭐⭐ MUST BE HERE ⭐⭐ */}
                                    <TreatmentSessionsProvider>
                                      <AppRoutes />
                                      <ScrollToTop />
                                    </TreatmentSessionsProvider>
                                  </SessionsProvider>
                                </RecurringRulesProvider>
                              </WorkshopsProvider>
                            </RetreatsProvider>
                          </RoomsProvider>
                        </DateSelectionProvider>
                      </BookingProvider>
                    </TreatmentsProvider>
                  </UploadProvider>
                </CategoriesProvider>
              </BrowserRouter>
            </FavoritesProvider>
          </UserProvider>
        </BirthChartProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
