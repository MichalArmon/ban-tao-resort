// DateInputGroup.jsx
import React from "react";
import { Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

function DateInputGroup({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 3,
        // 🛑 רספונסיביות: מעבר לטור במכשירים קטנים
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      {/* שדה תאריך כניסה */}
      <DatePicker
        label="Check-in Date"
        value={checkInDate}
        onChange={(newValue) => setCheckInDate(newValue)}
        minDate={dayjs()}
        slotProps={{
          textField: {
            fullWidth: true,
            color: "primary",
          },
        }}
      />

      {/* שדה תאריך יציאה */}
      <DatePicker
        label="Check-out Date"
        value={checkOutDate}
        onChange={(newValue) => setCheckOutDate(newValue)}
        // יציאה חייבת להיות לפחות יום אחרי כניסה
        minDate={checkInDate.add(1, "day")}
        slotProps={{
          textField: {
            fullWidth: true,
            color: "primary",
          },
        }}
      />
    </Box>
  );
}

export default DateInputGroup;
