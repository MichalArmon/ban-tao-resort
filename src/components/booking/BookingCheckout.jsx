import * as React from "react";
import { useNavigate } from "react-router-dom";
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
  Tooltip,
} from "@mui/material";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import { useBooking } from "../../context/BookingContext";
import { useSchedule } from "../../context/ScheduleContext";
import { useCategories } from "../../context/CategoriesContext"; // ✅ חדש

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
 * Small pieces
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

function BookingSummary({ sel }) {
  const title = sel?.item?.title || "Selected item";
  const img = sel?.item?.hero;
  const basePrice = sel?.item?.price ?? sel?.price ?? 0;
  const totalPrice = sel?.price ?? basePrice;
  const guests = Number(sel?.guests) || 1;
  const currency = sel?.currency ?? "ILS";
  const isRoom = sel?.type === "room";

  const dateLine = isRoom
    ? sel?.dates?.checkIn && sel?.dates?.checkOut
      ? `${new Date(sel.dates.checkIn).toLocaleDateString()} → ${new Date(
          sel.dates.checkOut
        ).toLocaleDateString()}`
      : "Select dates"
    : sel?.sessionDate
    ? new Date(sel.sessionDate).toLocaleString()
    : "Select date/time";

  const totalFormatted = formatMoney(totalPrice, currency);
  const baseFormatted = formatMoney(basePrice, currency);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
      {img && (
        <CardMedia
          component="img"
          image={img}
          alt={title}
          sx={{ height: 180, objectFit: "cover" }}
        />
      )}
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
            value={guests}
          />
          <SummaryRow
            icon={<PlaceRounded fontSize="small" />}
            label="Location"
            value={sel?.item?.location || "On site"}
          />
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.3}>
            <SummaryRow
              icon={<PaymentsRounded fontSize="small" />}
              label="Total price"
              value={totalFormatted}
            />
            {guests > 1 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4 }}
              >
                {`${baseFormatted} × ${guests} guests`}
              </Typography>
            )}
          </Stack>
        </Stack>
        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          No payment is taken now. You’ll confirm on the next step.
        </Alert>
      </CardContent>
    </Card>
  );
}

/* =========================================
 * DatePicker צבעוני לסדנאות
 * =======================================*/
function WorkshopDatePickerInline({
  guestSchedule,
  sessionDate,
  onSelectDate,
}) {
  const { categories } = useCategories();

  // הכנה לפי תאריכים
  const sessionsByDate = React.useMemo(() => {
    const map = {};
    guestSchedule.forEach((s) => {
      const d = new Date(s.date).toISOString().split("T")[0];
      const catColor =
        categories.find((c) => c._id === s.categoryId)?.color || "#7f8c8d";
      map[d] = { ...s, color: catColor };
    });
    return map;
  }, [guestSchedule, categories]);

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const iso = date.toISOString().split("T")[0];
    const session = sessionsByDate[iso];
    return { date, iso, session };
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Select a date:
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {days.map((d) => {
          const active = d.iso === sessionDate;
          const hasSession = !!d.session;
          const color = hasSession ? d.session.color : "#eee";
          const label = d.date.getDate();
          return (
            <Tooltip
              key={d.iso}
              title={
                hasSession
                  ? `${new Date(d.session.date).toLocaleString("he-IL")} — ${
                      d.session.studio
                    }`
                  : "No workshop"
              }
            >
              <span>
                <Button
                  variant={active ? "contained" : "outlined"}
                  size="small"
                  onClick={() => hasSession && onSelectDate(d.iso)}
                  disabled={!hasSession}
                  sx={{
                    minWidth: 50,
                    bgcolor: active ? color : "transparent",
                    borderColor: hasSession ? color : "#ccc",
                    color: active ? "#fff" : "inherit",
                    "&:hover": {
                      bgcolor: hasSession ? color : "transparent",
                      opacity: 0.9,
                    },
                  }}
                >
                  {label}
                </Button>
              </span>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}

/* =========================================
 * Main component
 * =======================================*/
export default function BookingCheckout() {
  const navigate = useNavigate();
  const { selection } = useBooking();
  const { guestSchedule, loadGuestSchedule } = useSchedule();

  React.useEffect(() => {
    if (selection?.type === "workshop") {
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const next = nextMonth.toISOString().split("T")[0];
      loadGuestSchedule(today, next);
    }
  }, [selection, loadGuestSchedule]);

  const [bookingData, setBookingData] = React.useState({
    guests: 1,
    sessionDate: selection?.dates?.sessionDate || "",
    price: selection?.item?.price ?? 0,
  });

  React.useEffect(() => {
    const basePrice = selection?.item?.price ?? selection?.price ?? 0;
    const total = basePrice * bookingData.guests;
    setBookingData((b) => ({ ...b, price: total }));
  }, [bookingData.guests, selection]);

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

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((b) => ({ ...b, [name]: value }));
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
      navigate("/resort/checkout/thank-you", {
        state: { selection: { ...selection, ...bookingData }, customer: form },
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
      <Grid container spacing={3} alignItems="flex-start">
        {/* שמאל – טופס */}
        <Grid item xs={12} md={7} lg={8} sx={{ width: "60%" }}>
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

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                maxWidth: 700,
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                px: { xs: 2, sm: 3 },
                py: { xs: 3, sm: 4 },
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  required
                  name="firstName"
                  label="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  required
                  name="lastName"
                  label="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  fullWidth
                />
              </Stack>

              <TextField
                required
                type="email"
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="phone"
                label="Phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                type="number"
                name="guests"
                label="Guests"
                value={bookingData.guests}
                onChange={handleBookingChange}
                fullWidth
                inputProps={{ min: 1 }}
              />

              {/* 🟣 תאריכים לסדנאות */}
              {selection?.type === "workshop" && (
                <WorkshopDatePickerInline
                  guestSchedule={guestSchedule}
                  sessionDate={bookingData.sessionDate}
                  onSelectDate={(date) =>
                    setBookingData((b) => ({ ...b, sessionDate: date }))
                  }
                />
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name="city"
                  label="City"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  name="zip"
                  label="ZIP"
                  value={form.zip}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  select
                  name="country"
                  label="Country"
                  value={form.country}
                  onChange={handleChange}
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
                onChange={handleChange}
                fullWidth
              />

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

              {error && <Alert severity="error">{error}</Alert>}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
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

        {/* ימין – סיכום */}
        <Grid
          item
          xs={12}
          md={5}
          lg={4}
          sx={{ position: { md: "sticky" }, top: { md: 16 }, width: "30%" }}
        >
          <BookingSummary sel={{ ...selection, ...bookingData }} />
        </Grid>
      </Grid>
    </Container>
  );
}
