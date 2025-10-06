// src/components/RoomCard.jsx
import React from "react";
import { Paper, Typography, Box, Button, Stack, Divider } from "@mui/material";
import { useBooking } from "../../context/BookingContext";

const RoomCard = ({ room, onTitleClick }) => {
  const {
    setSelectedRoomId,
    setFinalQuote,
    fetchQuote,
    checkIn,
    checkOut,
    selectedRoomId,
    finalQuote,
  } = useBooking();

  const imageUrl =
    room.imageURL || "https://via.placeholder.com/800x600?text=Room+Image";
  const isSelected = selectedRoomId === room._id;

  const handleSelectRoom = async () => {
    if (isSelected) {
      setSelectedRoomId(null);
      setFinalQuote(null);
      return;
    }
    setSelectedRoomId(room._id);
    setFinalQuote(null);
    try {
      const quoteData = await fetchQuote(room.roomType, checkIn, checkOut);
      setFinalQuote({
        price: quoteData.totalPrice,
        isRetreat: quoteData.isRetreatPrice,
        currency: quoteData.currency || "$",
      });
    } catch (err) {
      console.error("Failed to get quote:", err);
      setSelectedRoomId(null);
      setFinalQuote(null);
    }
  };

  // נגישות ללחיצה גם מהמקלדת על כותרת החדר (לפתיחת הפופאפ)
  const onTitleKeyDown = (e) => {
    if (!onTitleClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTitleClick();
    }
  };

  return (
    <Paper
      component="article"
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
        alignItems={{ xs: "stretch", sm: "stretch" }}
      >
        {/* תמונה */}
        <Box
          sx={{
            width: { xs: "100%", sm: 220 },
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
            alignSelf: { xs: "stretch", sm: "flex-start" },
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={`${room.roomType} photo`}
            loading="lazy"
            sx={{
              display: "block",
              width: "100%",
              height: { xs: 180, sm: 160 },
              objectFit: "cover",
              aspectRatio: { xs: "16 / 10", sm: "auto" },
            }}
          />
        </Box>

        {/* תוכן */}
        <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            // אם התקבל onTitleClick – הכותרת לחיצה/ממודגשת
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              cursor: onTitleClick ? "pointer" : "default",
              textDecoration: onTitleClick ? "underline" : "none",
              textUnderlineOffset: onTitleClick ? "3px" : undefined,
              "&:hover": onTitleClick
                ? { color: "primary.main", textDecorationThickness: "2px" }
                : undefined,
            }}
            role={onTitleClick ? "button" : undefined}
            tabIndex={onTitleClick ? 0 : undefined}
            onClick={onTitleClick}
            onKeyDown={onTitleKeyDown}
          >
            {room.roomType}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Max Guests: {room.capacity}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "-webkit-box",
              WebkitLineClamp: { xs: 2, sm: 3 },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {Array.isArray(room.amenities)
              ? room.amenities.join(", ")
              : room.amenities}
          </Typography>
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
                  ${room.basePrice}
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
                  Total: {finalQuote.currency}
                  {finalQuote.price}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Final Price
                </Typography>
                {finalQuote.isRetreat && (
                  <Typography variant="caption" color="error.main">
                    (Special rate applied)
                  </Typography>
                )}
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
};

export default RoomCard;
