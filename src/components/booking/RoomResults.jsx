// src/components/RoomResults.jsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress, // 🔑 Added for loading state
} from "@mui/material";
import { useBooking } from "../../context/BookingContext";
import RoomCard from "./RoomCard";

const RoomResults = () => {
  const { availableRooms, loading, error, message, checkIn, checkOut } =
    useBooking();

  // --- Handling Loading State ---
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Checking availability...
        </Typography>
      </Box>
    );
  }

  // --- Handling Error State ---
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="body1">
            Error checking availability: {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // --- Handling No Results State ---
  if (availableRooms.length === 0 && message) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          <Typography variant="body1">
            {/* 🔑 Message from the server (e.g., "Resort is closed" or "Not enough rooms") */}
            {message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // --- Handling Initial State (No search yet) ---
  if (availableRooms.length === 0 && !message && !error) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          Please select dates, guests, and rooms to begin your search.
        </Typography>
      </Box>
    );
  }

  // --- Displaying Results ---
  if (availableRooms.length > 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          {availableRooms.length} Available Room Offers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {/* 🔑 Translated and formatted dates */}
          Checking dates:{checkIn} to {checkOut}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Loop and display all available room units */}
        {availableRooms.map((room) => (
          <RoomCard
            key={room._id} // Unique MongoDB ID
            room={room}
          />
        ))}
      </Box>
    );
  }

  return null;
};

export default RoomResults;
