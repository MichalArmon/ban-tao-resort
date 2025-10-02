// src/components/RoomCard.jsx

import React from "react";
import { Paper, Typography, Box, Button } from "@mui/material";
import { useBooking } from "../../context/BookingContext"; // 🔑 Import Context

const RoomCard = ({ room }) => {
  const {
    setSelectedRoomId,
    setFinalQuote,
    fetchQuote,
    checkIn,
    checkOut,
    selectedRoomId,
    finalQuote,
  } = useBooking();

  // 🔑 Use the image URL from the room model or a placeholder
  const imageUrl =
    room.imageURL || "https://via.placeholder.com/200x150?text=Room+Image";

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
    } catch (error) {
      console.error("Failed to get quote:", error);
      setSelectedRoomId(null);
      setFinalQuote(null);
    }
  };

  return (
    <Paper
      sx={{
        p: 2, // Adjusted padding for better image fit
        mb: 3,
        // 🔑 Make the Paper a flex container for horizontal layout
        display: "flex",
        alignItems: "stretch",
        gap: 2, // Space between image and content
        // Conditional styling
        border: isSelected ? "2px solid #3f51b5" : "1px solid #ddd",
        backgroundColor: isSelected ? "#e3f2fd" : "white",
      }}
    >
      {/* 1. Image Container (Left Side) */}
      <Box
        sx={{
          width: "200px", // Fixed width for the image
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={room.roomType}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* 2. Content Container (Room Details + Price/Button) */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Room Details */}
        <Box sx={{ pr: 2 }}>
          <Typography variant="h6" component="h3" fontWeight="bold">
            {room.roomType}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max Guests: {room.capacity}
          </Typography>
          <Typography variant="caption" color="text.primary">
            {room.amenities.join(", ")}
          </Typography>
        </Box>

        {/* Price and Selection Button */}
        <Box
          sx={{
            textAlign: "right",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          {/* Price Display */}
          <Box>
            {!isSelected || !finalQuote ? (
              <>
                <Typography variant="h5" color="text.primary">
                  ${room.basePrice}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Base price per night
                </Typography>
              </>
            ) : (
              // FINAL QUOTE
              <Box>
                <Typography variant="h4" color="secondary" fontWeight="bold">
                  Total: {finalQuote.currency}
                  {finalQuote.price}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Final Price
                </Typography>
                {finalQuote.isRetreat && (
                  <Typography variant="caption" color="error">
                    (Special rate applied)
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Selection Button */}
          <Button
            variant="contained"
            color={isSelected ? "success" : "primary"}
            size="small"
            onClick={handleSelectRoom}
          >
            {isSelected ? "Selected (Click to Deselect)" : "Select Room"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RoomCard;
