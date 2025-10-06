import { ThemeProvider, CssBaseline } from "@mui/material";
import { themeStudio } from "../../theme";
import { Outlet } from "react-router-dom";
import PublicNav from "../public/PublicNav";

export default function StudioLayout() {
  return (
    <ThemeProvider theme={themeStudio}>
      <CssBaseline />
      <PublicNav />
      <Outlet />
    </ThemeProvider>
  );
}
