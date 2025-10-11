// src/components/RoomCard.jsx
import React from "react";
import { Paper, Typography, Box, Button, Stack, Divider } from "@mui/material";
import { useBooking } from "../../context/BookingContext";
import { useNavigate } from "react-router-dom";

const getImgUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    // array of objects/strings
    const first = val[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  // object with url/publicId
  return val?.url || null;
};

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const {
    setSelectedRoomId,
    setFinalQuote,
    fetchQuote,
    checkIn,
    checkOut,
    selectedRoomId,
    finalQuote,
  } = useBooking();

  const isSelected = selectedRoomId === room._id;

  // 🔧 קביעת תמונה בצורה בטוחה (תומך heroUrl/imageUrl/hero{url}/images[0].url/מחרוזת)
  const img =
    room.heroUrl ||
    room.imageUrl ||
    getImgUrl(room.hero) ||
    getImgUrl(room.images) ||
    "https://via.placeholder.com/800x600?text=Room+Image";

  const handleSelectRoom = async () => {
    if (isSelected) {
      setSelectedRoomId(null);
      setFinalQuote(null);
      return;
    }

    setSelectedRoomId(room._id);
    setFinalQuote(null);

    try {
      const quoteData = await fetchQuote(room.slug, checkIn, checkOut);
      setFinalQuote({
        price: quoteData.totalPrice,
        isRetreat: quoteData.isRetreatPrice,
        currency: quoteData.currency || room.currency || "USD",
      });
    } catch (err) {
      console.error("Failed to get quote:", err);
      setSelectedRoomId(null);
      setFinalQuote(null);
    }
  };

  const goToRoomPage = () =>
    navigate(`/resort/rooms/${room.slug}`, { state: room });

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: { xs: 2, sm: 3 },
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "action.hover" : "background.paper",
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
      >
        {/* תמונה */}
        <Box
          sx={{
            width: { xs: "100%", sm: 220 },
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={img}
            alt={`${room.title} photo`}
            loading="lazy"
            onClick={goToRoomPage}
            sx={{
              width: "100%",
              height: { xs: 180, sm: 160 },
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: 2,
            }}
          />
        </Box>

        {/* תוכן */}
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            onClick={goToRoomPage}
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              "&:hover": { color: "primary.main" },
            }}
          >
            {room.title}
          </Typography>

          {room.blurb && (
            <Typography variant="body2" color="text.secondary">
              {room.blurb}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary">
            Guests: {room.maxGuests ?? "-"} | Bed: {room.bedType ?? "-"} | Size:{" "}
            {room.sizeM2 ?? "-"} m²
          </Typography>

          {Array.isArray(room.features) && room.features.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {room.features.join(", ")}
            </Typography>
          )}
        </Stack>

        {/* מפריד במובייל */}
        <Divider sx={{ display: { xs: "block", sm: "none" }, my: 1 }} />

        {/* מחיר + כפתור */}
        <Stack
          spacing={1}
          alignItems={{ xs: "stretch", sm: "flex-end" }}
          justifyContent="space-between"
          sx={{ minWidth: { sm: 160 } }}
        >
          <Box>
            {!isSelected || !finalQuote ? (
              <>
                <Typography
                  sx={{
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                    fontWeight: 700,
                  }}
                >
                  {(room.currency || "USD") + " "}
                  {room.priceBase ?? "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Base price per night
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: { xs: "1.4rem", sm: "1.75rem" },
                    fontWeight: 800,
                    color: "secondary.main",
                  }}
                >
                  Total: {finalQuote.currency} {finalQuote.price}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Final Price
                </Typography>
              </>
            )}
          </Box>

          <Button
            variant="contained"
            color={isSelected ? "success" : "primary"}
            size="large"
            onClick={handleSelectRoom}
            sx={{
              width: { xs: "100%", sm: "auto" },
              py: { xs: 1.2, sm: 0.75 },
              borderRadius: { xs: 2, sm: 1 },
              fontSize: { xs: "1rem", sm: ".95rem" },
            }}
          >
            {isSelected ? "Selected — tap to deselect" : "Select Room"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
