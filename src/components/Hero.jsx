import { Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { pub } from "../../utils/publicPath";
import { Box, keyframes } from "@mui/system";

function Hero() {
  const wipeIn = keyframes`
  from { background-size: 0% 100%; }
  to   { background-size: 200% 100%; }
`;
  return (
    <Box
      className="hero" // תשאירי אם יש לך CSS חיצוני שאתה רוצה לשמור
      sx={{
        backgroundImage: `url(${pub("TRY_clean.jpg")})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignItems: "center",
        gap: { xs: "100px", md: "40px" },
        justifyContent: "center",
        paddingBottom: "100px",
      }}
    >
      <Typography
        component="h1"
        sx={{
          letterSpacing: { xs: ".08em", md: "10px" },
          fontWeight: { xs: 700, md: 300 },
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          fontSize: "clamp(40px, 10vw, 220px)", // ענק ורספונסיבי
        }}
      >
        B̂āN TAO
      </Typography>
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

            /* איטי וחלק יותר */
            animation: `${wipeIn} var(--dur, 2.8s) cubic-bezier(.22,1,.36,1) var(--delay, 300ms) both`,
            willChange: "background-size",

            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              WebkitTextFillColor: "currentColor",
              backgroundImage: "none",
            },
          }}
          style={{
            "--dur": "5s", // ← מהירות (גדול = יותר לאט)
            "--delay": "700ms", // ← דיליי לפני התחלה
            "--feather": "50%", // ← רכות הקצה
          }}
        >
          B̂āN TAO • Village Boutique • KOH PHANGAN • CHALOKLUM
        </Typography>

        <Button
          component={RouterLink}
          to="/guest"
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

export default Hero;
