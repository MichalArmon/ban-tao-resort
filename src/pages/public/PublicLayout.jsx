import { Fab, Typography } from "@mui/material";
import Footer from "../../components/Footer";
import Hero from "../../components/Hero";
import PublicNav from "./PublicNav";
import IntroBlock from "../../components/IntroBlock";
import TwoImageGrid from "../../components/TwoImageGrid";
import FullScreenImage from "../../components/FullScreenImage";
import Pblock from "../../components/Pblock";
import TwinImages from "../../components/TwinImages";
import { Phone } from "@mui/icons-material";
Phone;

function PublicLayout() {
  return (
    <>
      {/* כפתור שיחה צף בפינה */}
      <Fab
        aria-label="Call"
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
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
      <Hero />
      <IntroBlock />

      <TwoImageGrid />
      <FullScreenImage src="/landsccape2.jpg" navH={72} durationVH={220} />
      <Pblock
        title="THOUGHTFUL DESIGN INSIDE AND OUT"
        text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
        align="left"
      />
      <TwinImages />
    </>
  );
}

export default PublicLayout;
