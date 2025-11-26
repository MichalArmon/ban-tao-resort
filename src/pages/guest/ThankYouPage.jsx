import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import DownloadRounded from "@mui/icons-material/DownloadRounded";

export default function ThankYouPage() {
  return (
    <Box
      sx={{
        overflow: "hidden",
        minHeight: "calc(100vh - 64px)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/leaves-bg.png')", // 🌿 תמונה של עלים
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 0,
        m: 0,
      }}
    >
      <Card
        sx={{
          p: 4,
          maxWidth: 420,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "white",
          overflow: "hidden",
        }}
      >
        <CardContent>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Thank You!
          </Typography>
          <Typography color="text.secondary" mb={3}>
            We’re truly excited to welcome you soon and share this unique
            experience with you.
            <br /> <br />
            Your reservation has been received, and our team is preparing
            everything for your arrival.
          </Typography>

          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<DownloadRounded />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Click Here To Download Now
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
