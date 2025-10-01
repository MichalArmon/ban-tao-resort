import { Button, Fab, Typography } from "@mui/material";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import PublicNav from "./PublicNav";
import IntroBlock from "../../components/IntroBlock";
import TwoImageGrid from "../../components/TwoImageGrid";
import FullScreenImage from "../../components/FullScreenImage";
import Pblock from "../../components/Pblock";
import TwinImages from "../../components/TwinImages";
import { Phone } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { pub } from "../../../utils/publicPath";

function PublicLayout() {
  return (
    <>
      {/* כפתור שיחה צף בפינה */}
      <Fab
        aria-label="Call"
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          bgcolor: "#fff",
          color: "primary.main",
          border: "2px solid",
          borderColor: "primary.main",
          "&:hover": { bgcolor: "#fff" },
        }}
      >
        <Phone />
      </Fab>

      <PublicNav />
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
