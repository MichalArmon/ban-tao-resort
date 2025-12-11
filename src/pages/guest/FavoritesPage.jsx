import React from "react";
import { Box, Typography, Grid, Paper, Stack } from "@mui/material";
import { useFavorites } from "../../context/FavoritesContext";
import FavoriteButton from "../../components/common/FavoriteButton";

import { useEffect, useState } from "react";
import { GLOBAL_API_BASE } from "../../config/api";
import FancyHeading from "../../components/FancyHeading";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [fullData, setFullData] = useState({
    rooms: [],
    retreats: [],
    workshops: [],
    treatments: [],
  });

  // נחיתה של הדף — נטענו נתונים מלאים
  useEffect(() => {
    loadAll();
  }, [favorites]);

  async function loadAll() {
    const types = ["rooms", "retreats", "workshops", "treatments"];

    const result = {};

    for (const type of types) {
      const list = favorites[type] || [];

      // טוען פרטים מלאים עבור כל itemId
      const detailed = await Promise.all(
        list.map(async (item) => {
          const id = item.itemId || item._id;

          const res = await fetch(`${GLOBAL_API_BASE}/${type}/${id}`);
          const data = await res.json();

          return data; // ← מחזיר את האובייקט המלא של החדר/ריטריט
        })
      );

      result[type] = detailed;
    }

    setFullData(result);
  }

  const renderSection = (title, list, type) => {
    if (!list || list.length === 0) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 100, mb: 2 }}>
          {title}
        </Typography>

        <Grid container spacing={2}>
          {list.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 1,
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <Box
                  component="img"
                  src={item.hero?.url || item.hero || "/placeholder.jpg"}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />

                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" sx={{ fontWeight: 300 }}>
                    {item.title || item.name || "Untitled"}
                  </Typography>

                  <FavoriteButton itemId={item._id} itemType={type} />
                </Stack>

                {item.shortDescription && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {item.shortDescription}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, mt: 6 }}>
      <FancyHeading>Your Favorites</FancyHeading>

      {renderSection("Rooms", fullData.rooms, "room")}
      {renderSection("Workshops", fullData.workshops, "workshop")}
      {renderSection("Retreats", fullData.retreats, "retreat")}
      {renderSection("Treatments", fullData.treatments, "treatment")}
    </Box>
  );
}
