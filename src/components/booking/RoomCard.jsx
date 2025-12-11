// 📁 src/components/RoomCard.jsx
import React from "react";
import { Paper, Typography, Box, Button, Stack, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RoomPreviewDialog from "./RoomPreviewDialog";
import BookButton from "./BookButton";
import FavoriteButton from "../common/FavoriteButton";
import BookRoomButton from "./bookingButtons/BookRoomButton";

const getImgUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    const first = val[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  return val?.url || null;
};

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const img =
    room.heroUrl ||
    getImgUrl(room.hero) ||
    getImgUrl(room.images) ||
    "https://via.placeholder.com/800x600?text=Room+Image";

  const goToRoomPage = () =>
    navigate(`/resort/rooms/${room.slug}`, { state: room });

  return (
    <>
      {/* 🟣 עטיפה שמאפשרת להניח את הלייק בפינה */}
      <Box sx={{ position: "relative" }}>
        {/* ❤️ לייק בפינה הימנית העליונה */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 20,
          }}
        >
          <FavoriteButton
            itemId={room?._id?.toString()}
            itemType="room"
            item={room}
          />
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: { xs: 3, sm: 4 },
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            transition: "transform .2s ease, box-shadow .2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="stretch"
            spacing={{ xs: 2, sm: 3 }}
          >
            {/* 🖼️ תמונה */}
            <Box
              sx={{
                width: { xs: "100%", sm: 360, md: 400 },
                borderRadius: 2,
                overflow: "hidden",
                flexShrink: 0,
                cursor: "pointer",
                position: "relative",
              }}
              onClick={goToRoomPage}
            >
              <Box
                component="img"
                src={img}
                alt={`${room.title} photo`}
                loading="lazy"
                sx={{
                  display: "block",
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  transition: "transform .25s ease",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              />
            </Box>

            {/* 📝 תוכן */}
            <Stack
              spacing={1.2}
              justifyContent="space-between"
              sx={{ flexGrow: 1, py: { xs: 1, sm: 0.5 } }}
            >
              <Box>
                <Typography
                  variant="h6"
                  onClick={goToRoomPage}
                  sx={{
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "text.primary",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {room.title}
                </Typography>

                {room.blurb && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.5 }}
                  >
                    {room.blurb}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Guests: {room.maxGuests ?? "-"} | Bed: {room.bedType ?? "-"} |
                  Size: {room.sizeM2 ?? "-"} m²
                </Typography>

                {Array.isArray(room.features) && room.features.length > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {room.features.join(", ")}
                  </Typography>
                )}
              </Box>

              <Box>
                <Divider sx={{ my: 1.5 }} />

                {/* 💰 מחיר + כפתור BOOK */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "1.3rem", sm: "1.5rem" },
                      fontWeight: 700,
                      color: "text.primary",
                    }}
                  >
                    {room.currency || "USD"} {room.priceBase ?? "-"}
                  </Typography>
                  <BookRoomButton room={room} />
                </Stack>

                <Button
                  variant="text"
                  size="small"
                  onClick={() => setPreviewOpen(true)}
                  sx={{
                    alignSelf: "flex-start",
                    mt: 1,
                    textTransform: "none",
                    color: "primary.main",
                    "&:hover": {
                      textDecoration: "underline",
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  View details
                </Button>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <RoomPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        slug={room.slug}
        title={room.title}
      />
    </>
  );
}
