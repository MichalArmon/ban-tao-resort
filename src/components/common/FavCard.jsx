import React from "react";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import FavoriteButton from "../common/FavoriteButton";

export default function FavCard({ item, type }) {
  // ============================
  // NORMALIZE — unify all entities
  // ============================
  const title = item.title || item.name || item.label || "Untitled";

  const image =
    item.hero?.url ||
    item.hero ||
    item.image ||
    item.gallery?.[0]?.url ||
    item.images?.[0]?.url ||
    "/placeholder.jpg";

  const subtitle =
    (type === "room" && "Room") ||
    (type === "retreat" && "Retreat") ||
    (type === "treatment" && "Treatment") ||
    (type === "workshop" && "Workshop") ||
    "";

  const description =
    item.shortDescription ||
    item.blurb ||
    item.description ||
    item.place ||
    item.location ||
    "";

  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "0.25s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      {/* ❤️ Favorite in corner */}
      <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
        <FavoriteButton itemId={item._id} itemType={type} />
      </Box>

      {/* IMAGE */}
      <CardMedia
        component="img"
        src={image}
        alt={title}
        sx={{
          height: 150,
          width: "100%",
          objectFit: "cover",
          borderBottom: "1px solid #eee",
        }}
      />

      {/* CONTENT */}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {subtitle}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: "text.secondary" }}
            noWrap
          >
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
