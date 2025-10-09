// src/components/Hero.jsx
import { useEffect, useState } from "react";
import { Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { pub } from "../../utils/publicPath";
import { Box, keyframes } from "@mui/system";

export default function Hero() {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [fadeVideo, setFadeVideo] = useState(false);

  const IMG_FULL = pub("HERO.jpg");
  const LOGO_ANIM = pub("resortweb.webm");

  // ⏱ שליטה מדויקת בזמנים
  const START_FADE_AFTER_MS = 3800; // מתי להתחיל להעלים את הווידאו
  const VIDEO_FADE_MS = 450; // כמה זמן פייד הווידאו
  const WHITE_LAG_AFTER_VIDEO_MS = 60; // השהייה קטנה עד תחילת פייד המסך הלבן

  useEffect(() => {
    const fallback = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!imgLoaded) return;

    // 1) מתחילים להעלים את הווידאו
    const t1 = setTimeout(() => setFadeVideo(true), START_FADE_AFTER_MS);

    // 2) מעט אחרי שסיים להיעלם, מתחילים להעלים את המסך הלבן
    const t2 = setTimeout(
      () => setShowLoader(false),
      START_FADE_AFTER_MS + VIDEO_FADE_MS + WHITE_LAG_AFTER_VIDEO_MS
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [imgLoaded]);

  const wipeIn = keyframes`
    from { background-size: 0% 100%; }
    to   { background-size: 200% 100%; }
  `;

  return (
    <Box
      className="hero"
      aria-busy={showLoader ? "true" : "false"}
      sx={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: "100px", md: "40px" },
        pb: "100px",
        overflow: "hidden",
        bgcolor: "#f2f2f2",
      }}
    >
      {/* תמונת רקע */}
      <Box
        component="img"
        src={IMG_FULL}
        alt=""
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

      {/* מסך טעינה */}
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
          transition: "opacity 600ms ease", // פייד של המסך הלבן
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
            transition: `opacity ${VIDEO_FADE_MS}ms ease`, // פייד של הווידאו
            "@media (prefers-reduced-motion: reduce)": {
              transition: "none",
            },
          }}
        />
      </Box>

      {/* כותרת */}
      <Typography
        component="h1"
        sx={{
          zIndex: 2,
          letterSpacing: { xs: ".08em", md: "10px" },
          fontWeight: { xs: 700, md: 300 },
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          fontSize: "clamp(60px, 10vw, 220px)",
          textAlign: "center",
          px: 2,
        }}
      >
        B̂āN TAO
      </Typography>

      {/* פס תחתון */}
      <Paper
        sx={{
          display: "flex",
          px: { md: "34px", xs: "0" },
          py: { md: "20px", xs: "0" },
          borderRadius: 15,
          alignItems: "center",
          justifyContent: "center",
          gap: "30px",
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
          component={RouterLink}
          Link
          to="/resort/guest"
          variant="contained"
          size="large"
          sx={{
            width: { xs: "min(90vw, 560px)", md: "auto" },
            height: { xs: 72, md: 48 },
            fontSize: { xs: "1.25rem", md: "1rem" },
            px: { xs: 5, md: 3 },
            py: { xs: 2, md: 1 },
            borderRadius: { xs: 12, md: 8 },
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Check Availability
        </Button>
      </Paper>
    </Box>
  );
}
