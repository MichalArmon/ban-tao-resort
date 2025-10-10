import React from "react";
import { Box, Card, CardHeader, CardContent, Grid } from "@mui/material";
import RoomForm from "./RoomForm";

export default function AdminRooms() {
  return (
    <Box sx={{ pt: "var(--nav-h)", px: { xs: 2, md: 4 }, pb: 6 }}>
      <Card variant="outlined">
        <CardHeader
          title="Room Type Editor"
          subheader="יצירה/עדכון של סוג חדר בהתאם למודל RoomType"
        />
        <CardContent>
          <Grid container spacing={3}>
            <RoomForm />
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
