// src/components/GuestRoomPopover.jsx

import React, { useState, useCallback } from "react";
import {
  Popover,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PersonIcon from "@mui/icons-material/Person";
import HotelIcon from "@mui/icons-material/Hotel";
import { useBooking } from "../../context/BookingContext";

// Component for a single counter (e.g., Adults, Rooms)
const Counter = ({ label, count, setCount, min = 1, max = 10 }) => {
  const handleIncrement = () => setCount(count + 1);
  const handleDecrement = () => setCount(count - 1);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={handleDecrement}
          disabled={count <= min}
          size="small"
        >
          <RemoveIcon />
        </IconButton>
        <Typography
          component="span"
          sx={{ mx: 1, minWidth: "20px", textAlign: "center" }}
        >
          {count}
        </Typography>
        <IconButton
          onClick={handleIncrement}
          disabled={count >= max}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

// Main Popover Component
const GuestRoomPopover = ({ sx, ...props }) => {
  const {
    guests,
    setGuests,
    rooms,
    setRooms,
    fetchAvailability, // Fetch function to be called on confirmation
  } = useBooking();

  // MUI Popover state
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirm = () => {
    handleClose();
    // Automatically trigger search upon confirmation
    fetchAvailability();
  };

  const open = Boolean(anchorEl);
  const id = open ? "guest-room-popover" : undefined;

  return (
    <Box sx={sx} {...props}>
      {/* 🔑 The clickable element in the main bar */}
      <Button
        aria-describedby={id}
        variant="outlined"
        color="inherit"
        onClick={handleClick}
        startIcon={<PersonIcon />}
        sx={{
          width: "100%",
          height: "56px",
          minWidth: "auto",
          justifyContent: "flex-start",
          border: "1px solid",
          borderColor: "grey.300",
          textTransform: "none",
          backgroundColor: "white",
          "&:hover": { backgroundColor: "grey.50" },
        }}
      >
        {guests} Guests, {rooms} Rooms
      </Button>

      {/* The Actual Popover Menu */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          {/* Guests Counter */}
          <Counter
            label="Adults"
            count={guests}
            setCount={setGuests}
            min={1}
            max={10}
          />

          <Divider sx={{ my: 1 }} />

          {/* Rooms Counter */}
          <Counter
            label="Rooms"
            count={rooms}
            setCount={setRooms}
            min={1}
            max={5}
          />

          {/* Children Counter is omitted for simplicity but can be added here */}

          <Divider sx={{ my: 1 }} />

          {/* Confirmation Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleConfirm}
            sx={{ mt: 1 }}
          >
            Confirm
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default GuestRoomPopover;
