import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  keyframes,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AvailabilityPage from "../../components/booking/AvailabilityPage";
import { pub } from "../../../utils/publicPath";
import IntroBlock from "../../components/IntroBlock";
import TwoImageFeature from "../../components/TwoImageGrid";
import TwoImageGrid from "../../components/TwoImageGrid";
import Pblock from "../../components/Pblock";
import TwinImages from "../../components/TwinImages";
import { useLocation } from "react-router-dom";

// ✅ תמונות וקבצי וידאו
const IMG_FULL = pub("landscape20.jpg");
const LOGO_ANIM = pub("resortweb.webm");

export default function GuestHome() {
  const location = useLocation();

  // ⭐ האם המשתמש כבר ראה את האנימציה בעבר?
  const seenIntroBefore = localStorage.getItem("seenIntro") === "true";

  const [imgLoaded, setImgLoaded] = useState(false);

  // ⭐ מציגים אנימציה רק אם המשתמש *לא* ראה אותה
  const [showLoader, setShowLoader] = useState(!seenIntroBefore);

  const [fadeVideo, setFadeVideo] = useState(false);

  const START_FADE_AFTER_MS = 3800;
  const VIDEO_FADE_MS = 450;
  const WHITE_LAG_AFTER_VIDEO_MS = 60;

  // גלילה ל־Availability אם הגיע מעמוד אחר
  useEffect(() => {
    if (location.state?.scrollToAvailability) {
      const el = document.getElementById("availability-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  // fallback שאם משהו נתקע – לא ייתקע מסך לבן
  useEffect(() => {
    if (!showLoader) return;
    const fallback = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(fallback);
  }, [showLoader]);

  // שליטה באנימציית הלוגו
  useEffect(() => {
    if (!imgLoaded || !showLoader) return;

    const t1 = setTimeout(() => setFadeVideo(true), START_FADE_AFTER_MS);

    const t2 = setTimeout(() => {
      setShowLoader(false);

      // ⭐ מסמנים שהמשתמש ראה את האנימציה בפעם הראשונה
      localStorage.setItem("seenIntro", "true");
    }, START_FADE_AFTER_MS + VIDEO_FADE_MS + WHITE_LAG_AFTER_VIDEO_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [imgLoaded, showLoader]);

  const handleScroll = () => {
    const section = document.getElementById("availability-section");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const wipeIn = keyframes`
    from { background-size: 0% 100%; }
    to   { background-size: 200% 100%; }
  `;

  return (
    <>
      {/* ==============================
          🏝️ HERO SECTION
      ============================== */}
      <Box
        className="hero"
        aria-busy={showLoader ? "true" : "false"}
        sx={{
          position: "relative",
          width: "100vw",
          left: "50%",
          ml: "-50vw",
          height: { xs: "80vh", md: "100vh" },
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          color: "white",
          bgcolor: "#f2f2f2",
        }}
      >
        {/* 📸 תמונת רקע */}
        <Box
          component="img"
          src={IMG_FULL}
          alt="Ban Tao Resort"
          onLoad={() => setImgLoaded(true)}
          decoding="async"
          fetchpriority="high"
          sizes="100vw"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* ☀️ שכבת הצללה */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.4))",
            zIndex: 1,
          }}
        />

        {/* 🌀 מסך טעינה (לבן + וידאו) */}
        <Box
          aria-hidden={!showLoader}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: (t) => t.zIndex.modal + 1,
            bgcolor: "background.default",
            display: "grid",
            placeItems: "center",
            opacity: showLoader ? 1 : 0,
            pointerEvents: showLoader ? "auto" : "none",
            transition: "opacity 600ms ease",
          }}
        >
          <Box
            component="video"
            src={LOGO_ANIM}
            autoPlay
            muted
            playsInline
            sx={{
              width: { xs: 360, sm: 320, md: 680 },
              height: "auto",
              opacity: fadeVideo ? 0 : 1,
              transition: `opacity ${VIDEO_FADE_MS}ms ease`,
              "@media (prefers-reduced-motion: reduce)": {
                transition: "none",
              },
            }}
          />
        </Box>

        {/* ✨ תוכן ה־Hero */}
        <Container
          maxWidth="md"
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              letterSpacing: 4,
              mb: 2,
              textTransform: "uppercase",
              fontSize: { xs: "2.5rem", md: "4rem" },
              textShadow: "0px 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            BAN TAO RESORT
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
              textShadow: "0px 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            A peaceful retreat in Koh Phangan, Thailand
          </Typography>

          <Paper
            sx={{
              display: "flex",
              px: { md: "16px", xs: "0" },
              py: { md: "10px", xs: "0" },
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backgroundColor: "background.default",
              backdropFilter: "saturate(120%) blur(2px)",
            }}
          >
            <Typography
              sx={{
                display: { xs: "none", md: "block" },
                textTransform: "uppercase",
                WebkitTextFillColor: "transparent",
                backgroundImage:
                  "linear-gradient(to right, currentColor 0%, currentColor calc(100% - var(--feather, 28%)), transparent 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                backgroundRepeat: "no-repeat",
                backgroundSize: "0% 100%",
                animation: `${wipeIn} var(--dur, 2.8s) cubic-bezier(.22,1,.36,1) var(--delay, 300ms) both`,
                willChange: "background-size",
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                  WebkitTextFillColor: "currentColor",
                  backgroundImage: "none",
                },
              }}
              style={{
                "--dur": "5s",
                "--delay": "700ms",
                "--feather": "50%",
              }}
            >
              B̂āN TAO • Village Boutique • KOH PHANGAN • CHALOKLUM
            </Typography>

            <Button
              variant="contained"
              onClick={handleScroll}
              sx={{
                bgcolor: "primary.main",
                borderRadius: 7,
                px: 3,
                py: 1.2,
                fontSize: "1rem",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Check Availability
            </Button>
          </Paper>

          <KeyboardArrowDownRoundedIcon
            onClick={handleScroll}
            cursor="pointer"
            sx={{
              mt: 4,
              fontSize: 36,
              opacity: 0.8,
              animation: "bounce 2s infinite",
              "@keyframes bounce": {
                "0%, 100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(6px)" },
              },
            }}
          />
        </Container>
      </Box>

      {/* intro SECTION */}
      <Container maxWidth={false}>
        <IntroBlock />
        <div
          className="simpleParallax"
          style={{ backgroundImage: `url(${pub("landscape2.jpg")})` }}
        >
          <div className="foregroundContent"></div>
        </div>
        <TwoImageGrid />
        <Pblock
          title="THOUGHTFUL DESIGN INSIDE AND OUT"
          text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
          align="left"
        />
        <TwinImages />

        <div
          className="simpleParallax"
          style={{ backgroundImage: `url(${pub("landscape4.jpg")})` }}
        >
          <div className="foregroundContent">
            <Pblock
              title="THOUGHTFUL DESIGN INSIDE AND OUT"
              text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
              align="left"
            />
          </div>
        </div>
      </Container>

      {/* ==============================
          🗓️ AVAILABILITY SECTION
      ============================== */}
      <Box id="availability-section" sx={{ bgcolor: "#f9f5f0", py: 12 }}>
        <Container maxWidth="xl">
          <AvailabilityPage />
        </Container>
      </Box>
    </>
  );
}
