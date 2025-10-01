// GuestInput.jsx
import React from "react";
import { TextField } from "@mui/material";

function GuestInput({ guests, setGuests }) {
  return (
    <TextField
      label="Guests"
      type="number"
      fullWidth
      value={guests}
      onChange={(e) => setGuests(e.target.value)}
      inputProps={{ min: 1 }}
      color="primary"
      sx={{ mb: 4 }}
    />
  );
}

export default GuestInput;
