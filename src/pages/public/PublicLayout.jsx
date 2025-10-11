// src/pages/public/PublicLayout.jsx
import { ThemeProvider, CssBaseline, Box, Toolbar, Fab } from "@mui/material";
import { Phone } from "@mui/icons-material";
import { Outlet } from "react-router-dom";
import { themeResort } from "../../theme";
import PublicNav from "./PublicNav";

function PublicLayout() {
  return (
    <ThemeProvider theme={themeResort}>
      <CssBaseline />

      {/* ניווט קבוע בראש המסך */}
      <PublicNav />

      {/* Spacer בגובה ה-AppBar כדי שהתוכן לא יהיה מתחתיו */}
      <Toolbar sx={{ minHeight: "var(--nav-h)" }} />

      {/* אזור התוכן הראשי */}
      <Box
        component="main"
        sx={{
          minHeight: "calc(100dvh - var(--nav-h))",
          px: { xs: 2, md: 4 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Outlet />
      </Box>

      {/* כפתור שיחה צף בפינה */}
      <Fab
        aria-label="Call"
        component="a"
        href="tel:+972502136623"
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: (t) => t.zIndex.tooltip + 1,
          bgcolor: "#fff",
          color: "primary.main",
          border: "2px solid",
          borderColor: "primary.main",
          boxShadow: 2,
          "&:hover": { bgcolor: "#fff" },
        }}
      >
        <Phone />
      </Fab>
    </ThemeProvider>
  );
}

export default PublicLayout;
