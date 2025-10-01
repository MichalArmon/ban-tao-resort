// אם את על MUI v7+
import Grid from "@mui/material/Grid";
// אם את על MUI v6:
// import Grid from "@mui/material/Unstable_Grid2";

import { Box } from "@mui/material";
import { pub } from "../../utils/publicPath";

export default function TwinImages() {
  const bigFrame = {
    alignItems: "end",
    width: { xs: "90%", md: "70%" },

    aspectRatio: "9 / 16",
  };

  const img = {
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  return (
    <Box
      maxWidth="100%"
      sx={{
        bgcolor: "background.default",

        pb: 10,
        mx: "auto",
        px: 2,
        overflowX: "hidden", // מבטל את פס הגלילה האופקי
        justifyContent: "center",
      }}
    >
      <Grid
        container
        spacing={{ xs: 4, md: 0 }}
        sx={{
          alignItems: { xs: "stretch", md: "center", overflowX: "clip" },
          justifyContent: "center",
        }}
      >
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end", overflowX: "clip" },
            pr: { xs: 0, md: 5 },
          }}
        >
          <Box sx={bigFrame}>
            <Box
              component="img"
              src={pub("pool.jpg")}
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            justifyContent: {
              xs: "center",
              md: "flex-start",
              overflowX: "clip",
            },
            pl: { xs: 0, md: 5 },
          }}
        >
          <Box sx={bigFrame}>
            <Box
              component="img"
              src={pub("pool2.jpg")}
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
