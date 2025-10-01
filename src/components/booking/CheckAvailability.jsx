// CheckAvailability.jsx
import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// קומפוננטות הבנות שיצרנו
import DateInputGroup from "./DateInputGroup";
import GuestInput from "./GuestInput";
import AvailabilityBar from "./AvailabilityBar";

function CheckAvailability() {
  const [checkInDate, setCheckInDate] = useState(dayjs());
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(3, "day"));
  const [guests, setGuests] = useState(2);

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submission:", {
      checkIn: checkInDate.format("YYYY-MM-DD"),
      checkOut: checkOutDate.format("YYYY-MM-DD"),
      guests: guests,
    });
    alert(`Searching for availability...`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AvailabilityBar
        guests={guests}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={2} // הצללה חזקה למראה פרימיום
        sx={{
          bgcolor: "background.light",
          p: { xs: 3, sm: 4 }, // ריפוד רספונסיבי
          maxWidth: 450,
          mx: "auto",
          borderRadius: 2,
          // רקע חם מה-Theme
          border: "1px solid",
          borderColor: "secondary.main", // מסגרת עדינה
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "primary.main", // צבע כותרת ראשי
            mb: 3,
          }}
        >
          Check Availability
        </Typography>

        {/* 🛑 קומפוננטה 2: קבוצת תאריכים */}
        <DateInputGroup
          checkInDate={checkInDate}
          setCheckInDate={setCheckInDate}
          checkOutDate={checkOutDate}
          setCheckOutDate={setCheckOutDate}
        />

        {/* 🛑 קומפוננטה 3: שדה אורחים */}
        <GuestInput guests={guests} setGuests={setGuests} />

        {/* כפתור שליחה */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{
            py: 1.5,
            bgcolor: "primary.main",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Check Availability Now
        </Button>
      </Paper>
    </LocalizationProvider>
  );
}

export default CheckAvailability;
