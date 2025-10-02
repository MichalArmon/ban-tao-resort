// src/components/AvailabilityBar.jsx

import React from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useBooking } from "../../context/BookingContext";
import GuestRoomPopover from "./GuestRoomPopover";

const AvailabilityBar = () => {
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    rooms,
    setRooms,
    fetchAvailability,
    loading,
  } = useBooking();

  // פונקציות עזר לבטיחות הקלט
  const handleSetGuests = (value) => setGuests(Math.max(1, value));
  const handleSetRooms = (value) => setRooms(Math.max(1, value));

  // נגדיר מינימום אנשים פר חדר
  const maxGuests = rooms * 4;
  const minGuests = rooms * 1;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 2,

        alignItems: "center",
        p: 3,

        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 2,
        mb: 4,
        backgroundColor: "background.paper",
        boxShadow: 3,
        overflowX: "hidden",
        justifyContent: "center",
      }}
    >
      {/* 1. Check-In Date Picker */}
      <TextField
        label="Check-In"
        type="date"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        size="medium"
        sx={{
          minWidth: { xs: "100%", md: 240 },
          ".MuiOutlinedInput-root": { input: { fontSize: "18px" } },
        }}
      />

      {/* 2. Check-Out Date Picker */}
      <TextField
        label="Check-Out"
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        size="medium"
        sx={{
          minWidth: { xs: "100%", md: 240 },
          ".MuiOutlinedInput-root": { input: { fontSize: "18px" } },
        }}
      />

      {/* 3. Guests and Rooms Selector (הריבוע המבוקש) */}
      <GuestRoomPopover sx={{ minWidth: { xs: "100%", md: 260 } }} />
      {/* 4. Search Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={fetchAvailability} // מחובר ל-Context
        disabled={loading || !checkIn || !checkOut || guests < 1 || rooms < 1}
        startIcon={loading ? null : <SearchIcon />}
        sx={{
          px: 3,
          height: 56,
          alignSelf: { xs: "stretch", md: "auto" },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "search"}
      </Button>
    </Stack>
  );
};

export default AvailabilityBar;
