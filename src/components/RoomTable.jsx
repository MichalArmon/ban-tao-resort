// src/components/RoomTable.jsx (Updated with Context)

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useBooking } from "../context/BookingContext"; // 🔑 Import Context

// Component that calculates and displays the price for a specific room type
const RoomQuote = ({ room, checkIn, checkOut }) => {
  const { fetchQuote } = useBooking(); // 🔑 Get fetchQuote from Context
  const [price, setPrice] = useState("...");
  const [isRetreat, setIsRetreat] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    const getQuote = async () => {
      setLoadingQuote(true);
      try {
        // 🔑 Call the context's function
        const data = await fetchQuote(room.roomType, checkIn, checkOut);

        setPrice(data.totalPrice);
        setIsRetreat(data.isRetreatPrice);
      } catch (error) {
        setPrice("Error");
      } finally {
        setLoadingQuote(false);
      }
    };

    if (checkIn && checkOut) {
      getQuote();
    }
  }, [checkIn, checkOut, room.roomType, fetchQuote]); // Include fetchQuote in dependencies

  return (
    <Box sx={{ textAlign: "right", minWidth: "150px" }}>
      <Typography variant="h5" color="secondary" sx={{ fontWeight: "bold" }}>
        {loadingQuote ? (
          <CircularProgress size={20} color="secondary" />
        ) : (
          `₪${price}`
        )}
      </Typography>
      {isRetreat && (
        <Typography
          variant="caption"
          sx={{ color: "purple", fontStyle: "italic" }}
        >
          (Fixed Retreat Price)
        </Typography>
      )}
      <Button
        variant="contained"
        color="success"
        sx={{ mt: 1 }}
        startIcon={<CheckCircleOutlineIcon />}
      >
        Book Now
      </Button>
    </Box>
  );
};

// Main Room Table component (Remains the same as it receives props from AvailabilityPage)
const RoomTable = ({ rooms, checkIn, checkOut }) => {
  // ... (Grouping logic remains the same) ...
  const roomTypes = {};
  rooms.forEach((room) => {
    if (!roomTypes[room.roomType]) {
      roomTypes[room.roomType] = {
        details: room,
        count: 0,
      };
    }
    roomTypes[room.roomType].count++;
  });

  const uniqueRoomTypes = Object.values(roomTypes);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Available Rooms ({rooms.length} Total Rooms Found)
      </Typography>

      <Grid container spacing={3}>
        {uniqueRoomTypes.map((item) => (
          <Grid item xs={12} key={item.details._id}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Room Details */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" color="primary">
                  {item.details.roomType}
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{ ml: 1, color: "grey.600" }}
                  >
                    ({item.count} available)
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ my: 1 }}>
                  Description: {item.details.description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Base Price (per night): ₪{item.details.basePrice}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

              {/* Price Quote and Booking Button */}
              <RoomQuote
                room={item.details}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RoomTable;
