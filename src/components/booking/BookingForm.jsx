import * as React from "react";
import {
  Box,
  Stack,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useBooking } from "../../context/BookingContext";

/**
 * BookingForm (MUI) — uses BookingContext for all server calls
 *
 * Props:
 * - type: "room" | "treatment" | "workshop"
 * - item: the entity being booked (used for title, id, sessions, etc.)
 * - onClose?: () => void
 * - onSuccess?: (res) => void
 */
export default function BookingForm({ type, item, onClose, onSuccess }) {
  const {
    // customer (global, so other parts can reuse)
    customer,
    setCustomer,

    // dates for rooms
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,

    // server ops from context
    createBooking, // rooms/retreats flow
    createSimpleBooking, // workshops/treatments (/bookings/book)
    loading,
    error,
  } = useBooking();

  // local-only fields
  const [sessionId, setSessionId] = React.useState("");
  const [date, setDate] = React.useState(""); // treatment datetime-local
  const [localError, setLocalError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleCust = (key) => (e) =>
    setCustomer({ ...customer, [key]: e.target.value });

  const title =
    item?.title ||
    (type === "room"
      ? "Room"
      : type === "treatment"
      ? "Treatment"
      : "Workshop");

  const validate = () => {
    if (!customer.fullName?.trim()) return "Please enter your full name.";
    if (!customer.email?.trim()) return "Please enter your email.";
    if (type === "room") {
      if (!checkIn || !checkOut) return "Please select check-in and check-out.";
      if (new Date(checkOut) <= new Date(checkIn))
        return "Check-out must be after check-in.";
    }
    if (type === "treatment" && !date) return "Please select a date & time.";
    if (type === "workshop" && (item?.sessions?.length ?? 0) > 0 && !sessionId)
      return "Please select a session.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setLocalError(v);
      return;
    }

    try {
      let result;
      if (type === "room") {
        // roomType can be _id or slug, adjust if needed
        result = await createBooking({ roomType: item?._id || item?.slug });
      } else {
        result = await createSimpleBooking({
          type,
          itemId: item?._id,
          sessionId: type === "workshop" ? sessionId : undefined,
          date: type === "treatment" ? date : undefined,
        });
      }

      setSuccess("Booking created successfully!");
      if (typeof onSuccess === "function") onSuccess(result);
    } catch (err) {
      setLocalError(err?.message || "Something went wrong");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>
          Book {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete the form below and we’ll confirm your booking by email.
        </Typography>

        {(error || localError) && (
          <Alert severity="error">{localError || String(error)}</Alert>
        )}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={2}>
          {/* Full name */}
          <Grid item xs={12}>
            <TextField
              name="fullName"
              label="Full name"
              value={customer.fullName || ""}
              onChange={handleCust("fullName")}
              fullWidth
              required
            />
          </Grid>

          {/* Email / Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              type="email"
              label="Email"
              value={customer.email || ""}
              onChange={handleCust("email")}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              label="Phone"
              value={customer.phone || ""}
              onChange={handleCust("phone")}
              fullWidth
            />
          </Grid>

          {/* Conditional fields */}
          {type === "room" && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="checkIn"
                  label="Check-in"
                  type="date"
                  value={checkIn || ""}
                  onChange={(e) => setCheckIn(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="checkOut"
                  label="Check-out"
                  type="date"
                  value={checkOut || ""}
                  onChange={(e) => setCheckOut(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {type === "treatment" && (
            <Grid item xs={12}>
              <TextField
                name="date"
                label="Date & time"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {type === "workshop" && (item?.sessions?.length ?? 0) > 0 && (
            <Grid item xs={12}>
              <TextField
                name="sessionId"
                label="Select session"
                select
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Select…</MenuItem>
                {item.sessions.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {new Date(s.date).toLocaleDateString()} — {s.timeStart}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes (optional)"
              value={customer.notes || ""}
              onChange={handleCust("notes")}
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>

        <Divider />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {onClose && (
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? "Processing…" : "Confirm Booking"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
