import { Outlet, useLocation } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import PublicNav from "../public/PublicNav";
import MiniTopBar from "../public/MiniTopBar";
import BirthChartDialog from "../../components/BirthChartDialog";
import { useUser } from "../../context/UserContext";
import FloatingBirthChartButton from "../../components/FloatingBirthChartButton";

function GuestLayout() {
  const location = useLocation();
  const { user } = useUser();

  // 🟢 אם הנתיב מתחיל ב־/resort/guest → יש offset
  const isGuestHome = location.pathname.startsWith("/resort/guest");

  // גובה ה־MiniTopBar
  const miniBarHeight = 38;

  // offset של ה־PublicNav
  const navOffset = isGuestHome ? miniBarHeight : 0;

  return (
    <>
      {/* תמיד מוצג – הסרגל הדק העליון */}
      <MiniTopBar />

      {/* PublicNav מוזז לפי הנתיב */}
      <PublicNav
        offsetTop={navOffset}
        sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      />

      {/* Spacer לגובה של שני הסרגלים יחד */}
      <Toolbar
        sx={{
          minHeight: `calc(var(--nav-h, 64px) + ${navOffset}px)`,
        }}
      />

      {/* תוכן הדף */}
      <Box
        component="main"
        sx={{
          minHeight: "calc(100dvh - var(--nav-h, 64px))",
        }}
      >
        <Outlet />
        <BirthChartDialog />
        {user && <FloatingBirthChartButton />}
      </Box>
    </>
  );
}

export default GuestLayout;
