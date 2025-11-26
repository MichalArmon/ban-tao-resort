import { Outlet, useLocation } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import PublicNav from "../public/PublicNav";

function GuestLayout() {
  const location = useLocation();
  const isThankYouPage = location.pathname.includes("/thank-you");

  return (
    <>
      <PublicNav sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />

      {/* Spacer בגובה ה-AppBar הקבוע */}
      <Toolbar sx={{ minHeight: "var(--nav-h, 64px)" }} />

      {/* תוכן העמוד */}
      <Box
        component="main"
        sx={{
          minHeight: "calc(100dvh - var(--nav-h, 64px))",
          px: { xs: 2, md: 4 },
          pb: isThankYouPage ? 0 : { xs: 6, md: 8 }, // 🟢 בלי padding בדף תודה
          overflow: isThankYouPage ? "hidden" : "auto", // 🟢 בלי גלילה בדף תודה
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

export default GuestLayout;
