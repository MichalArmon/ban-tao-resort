// 📁 src/components/RoomResults.jsx
import React from "react";
import {
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import { useRooms } from "../../context/RoomContext"; // 👈 שינוי!
import { useBooking } from "../../context/BookingContext"; // עדיין צריך תאריכים

import RoomCard from "./RoomCard";

const RoomResults = () => {
  const { checkIn, checkOut } = useBooking(); // תאריכים נשארים בבוקינג

  const {
    availableRooms = [],
    availabilityLoading,
    availabilityError,
  } = useRooms(); // 👈 פה מגיעות התוצאות האמיתיות

  // --- Loading ---
  if (availabilityLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Checking availability...
        </Typography>
      </Box>
    );
  }

  // --- Error ---
  if (availabilityError) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Error: {availabilityError}</Alert>
      </Box>
    );
  }

  // --- Initial state ---
  if (availableRooms.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          Select dates and room type to begin your search.
        </Typography>
      </Box>
    );
  }

  // --- Results ---
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        {availableRooms.length} Available Room Offers
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Dates: {checkIn?.format("YYYY-MM-DD")} →{" "}
        {checkOut?.format("YYYY-MM-DD")}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {availableRooms.map((room) => (
        <RoomCard key={room._id || room.slug} room={room} />
      ))}
    </Box>
  );
};

export default RoomResults;
