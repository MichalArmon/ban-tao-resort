// 📁 src/components/booking/BookingCheckout.jsx
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";

// import { useBooking } from "../../context/BookingContext"; // אופציונלי

/* =========================================
 * Utils
 * =======================================*/
const COUNTRIES = ["Israel", "Thailand", "Greece", "USA", "UK"];

function formatMoney(n, currency = "ILS") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `${n} ${currency}`;
  }
}

/* =========================================
 * Small presentational pieces
 * =======================================*/
function SummaryRow({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

/** ❗️כאן זה רק כרטיס הסיכום — בלי טופס, בלי ניווט, בלי סטייט חיצוני */
function BookingSummary({ sel }) {
  const title = sel?.item?.title || "Selected item";
  const img = sel?.item?.hero;
  const price = sel?.price ?? 0;
  const currency = sel?.currency ?? "ILS";
  const isRoom = sel?.type === "room";

  const dateLine = isRoom
    ? sel?.dates?.checkIn && sel?.dates?.checkOut
      ? `${new Date(sel.dates.checkIn).toLocaleDateString()} → ${new Date(
          sel.dates.checkOut
        ).toLocaleDateString()}`
      : "Select dates"
    : sel?.dates?.sessionDate
    ? new Date(sel.dates.sessionDate).toLocaleString()
    : "Select date/time";

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {img ? (
        <CardMedia
          component="img"
          image={img}
          alt={title}
          sx={{ height: 180, objectFit: "cover" }}
        />
      ) : null}
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Stack spacing={1.2} sx={{ my: 1.5 }}>
          <SummaryRow
            icon={<CalendarMonthRounded fontSize="small" />}
            label={isRoom ? "Dates" : "Date"}
            value={dateLine}
          />
          <SummaryRow
            icon={<GroupRounded fontSize="small" />}
            label="Guests"
            value={sel?.guests || 1}
          />
          <SummaryRow
            icon={<PlaceRounded fontSize="small" />}
            label="Location"
            value={sel?.item?.location || "On site"}
          />
          <Divider sx={{ my: 1 }} />
          <SummaryRow
            icon={<PaymentsRounded fontSize="small" />}
            label="Price"
            value={formatMoney(price, currency)}
          />
        </Stack>

        <Alert severity="info" variant="outlined">
          No payment is taken now. You’ll confirm on the next step.
        </Alert>
      </CardContent>
    </Card>
  );
}

/* =========================================
 * Page: BookingCheckout (default export)
 * =======================================*/
export default function BookingCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // אם יש useBooking — קחי משם את ה־selection; אחרת מה-state
  const selection = state || null;

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "Israel",
    notes: "",
    agree: false,
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.agree) {
      setError("Please fill the required fields and accept the terms.");
      return;
    }

    try {
      setSubmitting(true);

      // כאן שימי את הקריאה האמיתית לשרת:
      // await createBooking({ ... });

      await new Promise((r) => setTimeout(r, 900)); // סימולציה

      navigate("/resort/checkout/thank-you", {
        state: { selection, customer: form },
      });
    } catch (err) {
      setError(err?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selection) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No selection was provided. Please choose a room/treatment/workshop and
          click BOOK again.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* לייאאוט: טופס משמאל, סיכום מימין */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* שמאל/מרכז – הטופס */}
        <Grid xs={12} md={7} lg={8} sx={{ width: " 60%" }}>
          <Paper
            variant="outlined"
            sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, bgcolor: "#fff" }}
          >
            <Typography variant="h5" gutterBottom>
              Fill in your details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We’ll use this information to confirm your booking.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="firstName"
                    label="First name"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="lastName"
                    label="Last name"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="email"
                    name="email"
                    label="Email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address"
                    label="Address"
                    value={form.address}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="city"
                    label="City"
                    value={form.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    fullWidth
                    name="zip"
                    label="ZIP"
                    value={form.zip}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    select
                    fullWidth
                    name="country"
                    label="Country"
                    value={form.country}
                    onChange={handleChange}
                  >
                    {COUNTRIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    name="notes"
                    label="Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                      />
                    }
                    label="I agree to the terms and privacy policy"
                  />
                </Grid>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? (
                    <CircularProgress size={22} />
                  ) : (
                    "Confirm booking"
                  )}
                </Button>
                <Button variant="text" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* ימין – סיכום הזמנה (דביק) */}
        <Grid
          item
          xs={12}
          md={5}
          lg={4}
          sx={
            ({ position: { md: "sticky" }, top: { md: 16 } }, { width: " 30%" })
          }
        >
          <BookingSummary sel={selection} />
        </Grid>
      </Grid>
    </Container>
  );
}
