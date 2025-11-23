import React from "react";
import {
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import { useRooms } from "../../context/RoomContext";
import RoomCard from "./RoomCard";
import { useDateSelection } from "../../context/DateSelectionContext";

const RoomResults = () => {
  const { checkIn, checkOut } = useDateSelection();

  const {
    availableRooms = [],
    availabilityLoading,
    availabilityError,
  } = useRooms();

  const normalizedRooms = availableRooms.flatMap((item) => {
    if (Array.isArray(item)) {
      return item.filter((r) => r && typeof r === "object" && r.slug);
    }
    return item && typeof item === "object" && item.slug ? item : [];
  });

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

  if (availabilityError) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Error: {availabilityError}</Alert>
      </Box>
    );
  }

  if (normalizedRooms.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 5 }}>
        <Typography variant="h6" color="text.secondary">
          Select dates and room type to begin your search.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        {normalizedRooms.length} Available Room Offers
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Dates: {checkIn?.format("YYYY-MM-DD")} →{" "}
        {checkOut?.format("YYYY-MM-DD")}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {normalizedRooms.map((room) => (
        <RoomCard key={room._id || room.slug} room={room} />
      ))}
    </Box>
  );
};

export default RoomResults;
