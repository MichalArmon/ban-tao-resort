import { Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { pub } from "../../utils/publicPath";

function Hero() {
  return (
    <div className="hero">
      <Typography
        component="h1"
        sx={{
          letterSpacing: { xs: ".08em", md: ".12em" },
          fontWeight: 300,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          fontSize: "clamp(56px, 12vw, 220px)", // ענק ורספונסיבי
        }}
      >
        Bân TAO
      </Typography>
      <Button
        component={RouterLink}
        to={pub("guest")}
        variant="contained"
        size="large"
        sx={{
          px: 3,
          borderRadius: 2,
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        Check Availability
      </Button>
    </div>
  );
}

export default Hero;
