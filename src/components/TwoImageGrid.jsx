// אם את על MUI v7+
import Grid from "@mui/material/Grid";
// אם את על MUI v6:
// import Grid from "@mui/material/Unstable_Grid2";

import { Box } from "@mui/material";
import { motion } from "framer-motion";

export default function TwoImageFeature() {
  const bigFrame = {
    "margin-left": "20px",
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 10", // יחס רחב לתמונה הגדולה
  };

  const smallCard = {
    marginRight: "100px",
    position: "relative",
    width: { xs: "60%", md: "55%" },
    height: { xs: 280, md: 440 },
    aspectRatio: "9 / 16", // ממש “ארוך” כמו מסך טלפון
    // קטנה יותר מהעמודה

    overflow: "hidden",
  };

  const img = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  return (
    <Box maxWidth="xl" sx={{ bgcolor: "background.default", mb: 60, pb: 10 }}>
      <Grid
        container
        spacing={4}
        sx={{
          alignItems: { xs: "stretch", md: "center" }, // ממרכז אנכית את הימני בדסקטופ
        }}
      >
        {/* שמאל: תמונה גדולה, רחבה */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={bigFrame}>
            <Box
              component="img"
              src="/portrait.jpg"
              alt="Warm minimal kitchen"
              sx={img}
            />
          </Box>
        </Grid>

        {/* ימין: תמונה קטנה ממוסגרת, מרוכזת */}
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" },
          }}
        >
          <motion.div
            initial={{ x: 200, opacity: 0 }} // מתחיל מחוץ למסך
            whileInView={{ x: 0, opacity: 1 }} // זז למקום כשנכנס לפריים
            viewport={{ once: true, amount: 0.25 }} // חצי מהאלמנט חייב להיות נראה
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box sx={smallCard}>
              <Box
                component="img"
                src="/landscape.jpg"
                alt="Cozy beige living room"
                sx={img}
              />
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
