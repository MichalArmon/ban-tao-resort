// AvailabilityBar.jsx (קוד מתוקן עם Props ועיצוב מקורי)
import React from "react"; // 🛑 אין צורך ב-useState כאן יותר
import { Box, Button, TextField, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// הקומפוננטה מקבלת את כל ה-State וה-Setters כ-Props
function AvailabilityBar({
  checkInDate, // Prop: ערך תאריך
  setCheckInDate, // Prop: פונקציה לעדכון תאריך
  checkOutDate, // Prop: ערך תאריך
  setCheckOutDate, // Prop: פונקציה לעדכון תאריך
  guests, // Prop: ערך מספרי (אם צריך)
  setGuests, // Prop: פונקציה לעדכון מספר אורחים
  guestsText, // Prop: טקסט האורחים הנוכחי
  setGuestsText, // Prop: פונקציה לעדכון טקסט האורחים
}) {
  // 🛑 פונקציית שליחה משתמשת ב-Props המעודכנים
  const handleSubmit = (event) => {
    event.preventDefault();
    // 💡 כאן תוכל להשתמש בערכי ה-Props המעודכנים: checkInDate, checkOutDate, guests
    console.log("Searching for availability...");
    alert("Searching for availability...");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={2}
        sx={{
          p: 1,
          mx: "auto",
          mb: "40px",
          borderRadius: 2,
          bgcolor: "background.light",
          border: "1px solid",
          borderColor: "secondary.main",

          // 🛑 סידור אופקי Flexbox
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 2 },
          width: { xs: "95%", md: "80%" },
        }}
      >
        {/* 1. שדות תאריך */}
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            variant="outlined"
            // 🛑 שימוש בערכים שהתקבלו כ-Props
            value={`Wed, ${checkInDate.format("D MMM")} - ${checkOutDate.format(
              "D MMM"
            )}`}
            label="Select dates"
            size="small"
            fullWidth
            sx={{
              // הסתרת הגבול
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiInputBase-root": { paddingRight: 0 },
            }}
          />
        </Box>

        {/* 2. שדה אורחים */}
        <Box
          sx={{
            flexGrow: 1,
            borderLeft: "1px solid",
            borderColor: "secondary.main",
          }}
        >
          <TextField
            variant="outlined"
            // 🛑 שימוש ב-guestsText שהתקבל כ-Prop
            value={guests + " people"}
            // label="Select rooms and guests"
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiInputBase-root": { paddingLeft: 1 },
            }}
          />
        </Box>

        {/* 3. שדה קוד קופון */}
        <Box
          sx={{
            flexGrow: 1,
            borderLeft: "1px solid",
            borderColor: "secondary.main",
          }}
        >
          <TextField
            variant="outlined"
            label="Add promo code"
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "& .MuiInputBase-root": { paddingLeft: 1 },
            }}
          />
        </Box>

        {/* 4. כפתור */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            minWidth: 100,
            py: 1.5,
            bgcolor: "primary.main",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" },
            flexShrink: 0,
          }}
        >
          Book
        </Button>
      </Paper>
    </LocalizationProvider>
  );
}

export default AvailabilityBar;
