// 📁 src/pages/guest/BookingCheckout.jsx
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
} from "@mui/material";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import { useBooking } from "../../context/BookingContext";
import { useSessions } from "../../context/SessionsContext";
import moment from "moment-timezone";

import WorkshopDatePickerInline from "./WorkshopDatePickerInline";

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

/* =========================================
 * Booking summary card
 * =======================================*/
function BookingSummary({ sel, onConfirm, submitting }) {
  const title = sel?.item?.title || "Selected item";
  const img = sel?.item?.hero;
  const basePrice = sel?.item?.price ?? sel?.price ?? 0;
  const totalPrice = sel?.price ?? basePrice;
  const guests = Number(sel?.guests) || 1;
  const currency = sel?.currency ?? "ILS";
  const isRoom = sel?.type === "room";

  // ✅ נציג את התאריך והשעה לפי Asia/Bangkok
  let dateLine = "Select date/time";
  if (isRoom && sel?.dates?.checkIn && sel?.dates?.checkOut) {
    dateLine = `${new Date(
      sel.dates.checkIn
    ).toLocaleDateString()} → ${new Date(
      sel.dates.checkOut
    ).toLocaleDateString()}`;
  } else if (sel?.sessionLabel) {
    dateLine = sel.sessionLabel;
  } else if (sel?.sessionDate) {
    dateLine =
      moment
        .utc(sel.sessionDate)
        .tz(sel?.tz || "Asia/Bangkok")
        .format("DD.MM.YYYY, HH:mm") + (sel?.studio ? ` — ${sel.studio}` : "");
  }

  const totalFormatted = formatMoney(totalPrice, currency);
  const baseFormatted = formatMoney(basePrice, currency);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {img && (
        <CardMedia
          component="img"
          image={img}
          alt={title}
          sx={{ height: "auto", objectFit: "cover" }}
        />
      )}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
        </Box>

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

        <Alert severity="info" variant="outlined" sx={{ mt: 2, mb: 2 }}>
          No payment is taken now. You’ll confirm on the next step.
        </Alert>

        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={submitting}
          fullWidth
          sx={{ mt: "auto" }}
        >
          {submitting ? <CircularProgress size={22} /> : "Confirm booking"}
        </Button>
      </CardContent>
    </Card>
  );
}

/* =========================================
 * MAIN COMPONENT
 * =======================================*/
export default function BookingCheckout() {
  const navigate = useNavigate();
  const { selection, createBooking, clearSelection } = useBooking();
  const { sessions, loadSessions } = useSessions();

  React.useEffect(() => {
    if (selection?.type === "workshop" && selection?.item?._id) {
      const today = moment().startOf("day").toDate();
      const nextMonth = moment().add(1, "month").endOf("month").toDate();
      loadSessions({
        from: today,
        to: nextMonth,
        workshopId: selection.item._id,
      });
    }
  }, [selection, loadSessions]);

  const [bookingData, setBookingData] = React.useState({
    guests: 1,
    sessionDate: "",
    sessionId: "",
    sessionLabel: "",
    price: selection?.item?.price ?? 0,
  });
  // ✅ אם המשתמש הגיע מהכפתור BOOK – נכניס את התאריך והשעה שנבחרו
  React.useEffect(() => {
    if (
      selection?.type === "workshop" && // רק אם מדובר בסדנה
      selection?.sessionDate && // ויש תאריך נבחר
      !bookingData.sessionDate // ורק אם עוד לא הוזן בצ'קאאוט
    ) {
      setBookingData((b) => ({
        ...b,
        sessionDate: selection.sessionDate, // התאריך שנבחר
        sessionId: selection.sessionId || "", // מזהה הסשן
        ruleId: selection.ruleId || null, // החוק (אם יש)
        sessionLabel: moment
          .utc(selection.sessionDate)
          .tz(selection?.tz || "Asia/Bangkok")
          .format("DD/MM/YYYY — HH:mm"),
      }));
    }
  }, [selection]);

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

  React.useEffect(() => {
    const basePrice = selection?.item?.price ?? selection?.price ?? 0;
    const total = basePrice * bookingData.guests;
    setBookingData((b) => ({ ...b, price: total }));
  }, [bookingData.guests, selection]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((b) => ({ ...b, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.agree) {
      setError("Please fill the required fields and accept the terms.");
      return;
    }

    if (selection?.type === "workshop" && !bookingData.sessionId) {
      setError("Please select a workshop date/time before confirming.");
      return;
    }

    try {
      setSubmitting(true);
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      // ✅ נוודא שהתאריך נשלח לפי Asia/Bangkok כ-UTC אמיתי
      const tz = bookingData.tz || "Asia/Bangkok";
      const dateInBangkokUTC = bookingData.sessionDate
        ? moment.tz(bookingData.sessionDate, tz).utc().toISOString()
        : null;

      const payload = {
        type: selection?.type,
        itemId: selection?.item?._id || selection?.item?.id,
        totalPrice: bookingData.price,
        guestCount: bookingData.guests,
        currency: selection?.currency || "ILS",
        date: dateInBangkokUTC, // ✅ שמירה בפורמט UTC אמיתי של תאילנד
        sessionId: bookingData.sessionId,
        ruleId: bookingData.ruleId || selection?.ruleId || null,
        tz, // ✅ נשלח גם אזור זמן מפורש
        guestInfo: {
          fullName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        },
      };

      console.log("📤 Sending booking payload:", payload);

      const newBooking = await createBooking(payload);
      clearSelection();
      navigate("/resort/checkout/thank-you", {
        state: { booking: newBooking, customer: form },
      });
    } catch (err) {
      console.error("❌ Booking failed:", err);
      setError(err?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selection)
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning">
          No selection provided. Please choose an item and click BOOK again.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 },
        display: "flex",
        gap: 3,
        alignItems: "stretch",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left side - form */}
      <Grid item xs={12} md={7} lg={8}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Fill in your details
          </Typography>

          {selection?.type === "workshop" && (
            <WorkshopDatePickerInline
              key={selection?._id || "picker"}
              guestSchedule={sessions}
              sessionDate={bookingData.sessionDate}
              onSelectDate={(date, id, session) => {
                console.log("📅 onSelectDate called:", { date, id, session });

                // ✅ חישוב נכון של זמן תאילנד
                const tz = session?.tz || "Asia/Bangkok";
                const startBangkok = moment.utc(session.start).tz(tz);
                const sessionLabel = session
                  ? `${startBangkok.format("DD/MM/YYYY, HH:mm")} — ${
                      session.studio || "Studio"
                    }`
                  : "";

                setBookingData((b) => ({
                  ...b,
                  sessionDate: date,
                  sessionId: id || "",
                  sessionLabel,
                  tz,
                  studio: session?.studio || "",
                }));
              }}
            />
          )}

          {/* Form fields */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {/* כל השדות נשארו בדיוק אותו דבר */}
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
            </Stack>

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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                name="guests"
                label="Guests"
                value={bookingData.guests}
                onChange={handleBookingChange}
                inputProps={{ min: 1 }}
                fullWidth
              />
              <TextField
                multiline
                minRows={2}
                name="notes"
                label="Notes (optional)"
                value={form.notes}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

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

            <Button variant="text" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Right side - summary */}
      <Grid item xs={12} md={5} lg={4}>
        <BookingSummary
          sel={{ ...selection, ...bookingData }}
          onConfirm={handleSubmit}
          submitting={submitting}
        />
      </Grid>
    </Container>
  );
}
