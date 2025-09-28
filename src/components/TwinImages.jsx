// אם את על MUI v7+
import Grid from "@mui/material/Grid";
// אם את על MUI v6:
// import Grid from "@mui/material/Unstable_Grid2";

import { Box } from "@mui/material";
import { motion } from "framer-motion";

export default function TwinImages() {
  const bigFrame = {
    position: "relative",
    width: "70%",
    aspectRatio: "9 / 16", // יחס רחב לתמונה הגדולה
  };

  const img = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };
  const base = import.meta.env.BASE_URL;

  return (
    <Box
      maxWidth="xl"
      sx={{
        bgcolor: "background.default",
        mb: 60,
        pb: 10,
        justifyContent: "center",
      }}
    >
      <Grid
        container
        maxWidth="lg"
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", md: "right" },
          justifyContent: "center",
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={bigFrame}>
            <Box
              component="img"
              src={base + "/pool.jpg"}
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={bigFrame}>
            <Box
              component="img"
              src={base + "/pool2.jpg"}
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
