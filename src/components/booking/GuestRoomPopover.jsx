// 📁 src/components/GuestRoomPopover.jsx
import React, { useState } from "react";
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
import { useBooking } from "../../context/BookingContext";

/* ============================================================
   🧩 Counter Component (for Adults / Rooms)
   ============================================================ */
const Counter = ({ label, count, setCount, min = 1, max = 10 }) => {
  const handleIncrement = () => setCount((prev) => Math.min(prev + 1, max));
  const handleDecrement = () => setCount((prev) => Math.max(prev - 1, min));

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

/* ============================================================
   🌿 Main GuestRoomPopover Component
   ============================================================ */
const GuestRoomPopover = ({ sx }) => {
  const {
    guests,
    setGuests,
    rooms,
    setRooms,
    fetchAvailability, // פונקציה שמופעלת בלחיצה על Confirm
  } = useBooking();

  // מצב הפתיחה של הפופאובר
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "guest-room-popover" : undefined;

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleConfirm = () => {
    handleClose();
    fetchAvailability(); // מפעיל את החיפוש המעודכן
  };

  return (
    <Box sx={sx}>
      {/* 🔘 כפתור פתיחת הפופאובר */}
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

      {/* 🪄 הפופאובר עצמו */}
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
          {/* 🔢 מונה אורחים */}
          <Counter
            label="Adults"
            count={guests}
            setCount={setGuests}
            min={1}
            max={10}
          />

          <Divider sx={{ my: 1 }} />

          {/* 🏨 מונה חדרים */}
          <Counter
            label="Rooms"
            count={rooms}
            setCount={setRooms}
            min={1}
            max={5}
          />

          <Divider sx={{ my: 1 }} />

          {/* ⚡ כפתור אישור */}
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
