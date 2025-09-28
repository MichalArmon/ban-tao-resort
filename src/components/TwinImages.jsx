// אם את על MUI v7+
import Grid from "@mui/material/Grid";
// אם את על MUI v6:
// import Grid from "@mui/material/Unstable_Grid2";

import { Box } from "@mui/material";

export default function TwinImages() {
  const bigFrame = {
    alignItems: "end",
    width: "70%",

    aspectRatio: "9 / 16",
  };

  const img = {
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
        mx: "auto",
        px: 2,
        overflowX: "hidden", // מבטל את פס הגלילה האופקי
        justifyContent: "center",
      }}
    >
      <Grid
        container
        disableEqualOverflow
        sx={{
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "center",
        }}
      >
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "flex-end", pr: 5 }}
        >
          <Box sx={bigFrame}>
            <Box
              component="img"
              src={base + "/pool.jpg"}
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "flex-start", pl: 5 }}
        >
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
