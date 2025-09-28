import { Button, Typography } from "@mui/material";

function Hero() {
  return (
    <div className="hero">
      <Typography
        component="h1"
        sx={{
          textTransform: "uppercase",
          letterSpacing: { xs: ".08em", md: ".12em" },
          fontWeight: 300,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          fontSize: "clamp(56px, 12vw, 220px)", // ענק ורספונסיבי
        }}
      >
        BAN TAO
      </Typography>
    </div>
  );
}

export default Hero;
