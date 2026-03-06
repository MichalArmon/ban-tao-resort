// 📁 src/components/booking/CheckoutForm.jsx
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

const COUNTRIES = ["Israel", "Greece", "USA", "UK"];

export default function CheckoutForm({
  form,
  bookingData,
  error,
  onFormChange,
  onSubmit,
  onBack,
}) {
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

      <TextField
        multiline
        minRows={2}
        name="notes"
        label="Notes (optional)"
        value={form.notes}
        onChange={onFormChange}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox name="agree" checked={form.agree} onChange={onFormChange} />
        }
        label="I agree to the terms and privacy policy"
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction="row" justifyContent="space-between">
        <Button variant="text" onClick={onBack}>
          Back
        </Button>
      </Stack>
    </Box>
  );
}
