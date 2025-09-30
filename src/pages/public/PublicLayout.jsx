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
      <div className="wrapper">
        {" "}
        כפתור שיחה צף בפינה
        <PublicNav />
        <Hero />
        <IntroBlock />
        <TwoImageGrid />
        <div className="picDiv">
          {" "}
          <img
            className="bgImage"
            src={pub("landscape2.jpg")}
            alt="Landscape"
          />
        </div>
        {/* <FullScreenImage src="/landscape2.jpg" navH={72} durationVH={100} /> */}
        <Pblock
          title="THOUGHTFUL DESIGN INSIDE AND OUT"
          text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
          align="left"
        />
        <TwinImages />
        <div className="picDiv">
          {" "}
          <img
            className="bgImage"
            src={pub("landscape3.jpg")}
            alt="Landscape 3"
          />
        </div>
        <Pblock
          title="THOUGHTFUL DESIGN INSIDE AND OUT"
          text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
          align="left"
        />
      </div>
    </>
  );
}

export default PublicLayout;
