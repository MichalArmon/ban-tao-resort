// 📁 src/components/FloatingBirthChartButton.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { useBirthChart } from "../context/BirthChartContext";

export default function FloatingBirthChartButton() {
  const { setProfileOpen } = useBirthChart();

  // ⭐ introMode נקבע לפי localStorage
  const [introMode, setIntroMode] = React.useState(() => {
    return !localStorage.getItem("seenBirthChartIntro");
  });

  const exitIntro = () => {
    localStorage.setItem("seenBirthChartIntro", "1");
    setIntroMode(false);
  };

  const handleClick = () => {
    if (introMode) {
      exitIntro();
      return;
    }
    setProfileOpen(true);
  };

  return (
    <>
      {/* ⭐ OVERLAY כהה/מטושטש מאחורי הפופאפ */}
      {introMode && (
        <Box
          onClick={exitIntro}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(3px)",
            zIndex: 2999,
            animation: "fadeBg 0.3s ease-out",
            "@keyframes fadeBg": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        />
      )}

      {/* ⭐ INTRO POPUP MODE */}
      {introMode && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3000,
            width: "90%",
            maxWidth: 420,
            bgcolor: "white",
            borderRadius: "24px",
            p: 4,
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            textAlign: "center",
            animation: "fadeIn 0.5s ease-out",

            "@keyframes fadeIn": {
              from: {
                opacity: 0,
                transform: "translate(-50%, -50%) scale(0.7)",
              },
              to: {
                opacity: 1,
                transform: "translate(-50%, -50%) scale(1)",
              },
            },
          }}
        >
          {/* ❌ close button */}
          <Box
            onClick={exitIntro}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#f7f7f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              transition: "0.2s",

              "&:hover": {
                background: "#eee",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </Box>

          {/* MAIN CTA BUTTON */}
          <Box
            onClick={handleClick}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.2,
              px: 4,
              py: 1.8,
              borderRadius: "20px",
              backgroundColor: "#75d480",
              color: "white",
              fontSize: "22px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "0.3s",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",

              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 10px 26px rgba(0,0,0,0.28)",
              },
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 26 }} />
            Generate Birth Chart
          </Box>

          {/* DESCRIPTION TEXT */}
          <Typography
            sx={{
              mt: 2.5,
              fontSize: "17px",
              color: "#444",
              lineHeight: 1.5,
            }}
          >
            Fill in your details in 5 seconds and receive
            <br />
            your personal astrology birth chart ✨
          </Typography>
        </Box>
      )}

      {/* ⭐ FLOATING SIDE BUTTON */}
      {!introMode && (
        <Box
          onClick={handleClick}
          sx={{
            position: "fixed",
            top: 200,
            right: -20,
            zIndex: 2000,
            pr: 4,
            pl: 2,
            py: 0.8,
            borderRadius: "20px 20px 20px 0",
            backgroundColor: "#75d480",
            color: "white",
            fontSize: "18px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 0.7,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            transition: "0.3s ease",
            animation: "slideIn 0.5s ease",

            "@keyframes slideIn": {
              from: { opacity: 0, transform: "translateX(50px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },

            "&:hover": {
              transform: "translateY(-2px)",
            },
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
          Generate Birth Chart
        </Box>
      )}
    </>
  );
}
