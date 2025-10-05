import { Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { pub } from "../../utils/publicPath";

function Hero() {
  return (
    <div
      className="hero"
      style={{
        backgroundImage: `url(${pub("TRY_clean.jpg")})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Typography
        component="h1"
        sx={{
          letterSpacing: { xs: ".08em", md: "10px" },
          fontWeight: 300,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1,
          fontSize: "clamp(56px, 12vw, 220px)", // ענק ורספונסיבי
        }}
      >
        B̂āN TAO
      </Typography>
      <Paper
        sx={{
          display: "flex",
          px: "34px",
          py: "20px",
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
          }}
        >
          {" "}
          B̂āN TAO • Village Boutique • KOH PHANGAN • CHALOKLUM
        </Typography>
        <Button
          component={RouterLink}
          to="/guest"
          variant="contained"
          size="large"
          sx={{
            px: 3,
            borderRadius: 8,
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Check Availability
        </Button>
      </Paper>
    </div>
  );
}

export default Hero;
