import React from "react";
import {
  Box,
  TextField,
  Stack,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
} from "@mui/material";
import { useBooking } from "../../context/BookingContext";

const COUNTRIES = ["Israel", "Greece", "USA", "UK"];

export default function CheckoutForm({
  form,
  bookingData,
  error,
  onFormChange,
  onBookingChange,
  onSubmit,
  onBack,
}) {
  const { selection } = useBooking();
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          required
          name="firstName"
          label="First name"
          value={form.firstName}
          onChange={onFormChange}
          fullWidth
        />
        <TextField
          required
          name="lastName"
          label="Last name"
          value={form.lastName}
          onChange={onFormChange}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          required
          type="email"
          name="email"
          label="Email"
          value={form.email}
          onChange={onFormChange}
          fullWidth
        />
        <TextField
          name="phone"
          label="Phone"
          value={form.phone}
          onChange={onFormChange}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          name="address"
          label="Address"
          value={form.address}
          onChange={onFormChange}
          fullWidth
        />
        <TextField
          name="city"
          label="City"
          value={form.city}
          onChange={onFormChange}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          name="zip"
          label="ZIP"
          value={form.zip}
          onChange={onFormChange}
          fullWidth
        />
        <TextField
          select
          name="country"
          label="Country"
          value={form.country}
          onChange={onFormChange}
          fullWidth
        >
          {COUNTRIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {selection?.type !== "room" && (
          <TextField
            type="number"
            name="guests"
            label="Guests"
            value={bookingData.guests}
            onChange={onBookingChange}
            inputProps={{ min: 1 }}
            fullWidth
          />
        )}
        <TextField
          multiline
          minRows={2}
          name="notes"
          label="Notes (optional)"
          value={form.notes}
          onChange={onFormChange}
          fullWidth
        />
      </Stack>

      <FormControlLabel
        control={
          <Checkbox name="agree" checked={form.agree} onChange={onFormChange} />
        }
        label="I agree to the terms and privacy policy"
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button variant="text" onClick={onBack}>
        Back
      </Button>
    </Box>
  );
}
