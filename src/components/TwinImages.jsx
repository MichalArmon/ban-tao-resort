// TwinImages.jsx
import { Grid, Box } from "@mui/material";

export default function TwinImages() {
  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Box sx={{ width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
          <img src="/pool1.jpg" alt="Pool chairs left" style={imgStyle} />
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ width: "100%", aspectRatio: "4 / 5", overflow: "hidden" }}>
          <img src="/pool2.jpg" alt="Pool chairs right" style={imgStyle} />
        </Box>
      </Grid>
    </Grid>
  );
}
