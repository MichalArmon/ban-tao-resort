// 📁 src/pages/guest/BookingCheckout.jsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";

// Hooks & Components
import { useBooking } from "../../context/BookingContext";
import { useSessions } from "../../context/SessionsContext";
import WorkshopDatePickerInline from "../../components/booking/WorkshopDatePickerInline";
import BookingSummary from "../../components/booking/BookingSummary";
import CheckoutForm from "../../components/booking/CheckoutForm";
import AvailabilityBar from "../../components/booking/AvailabilityBar";

export default function BookingCheckout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { selection, createBooking, clearSelection } = useBooking();
  const { sessions, loadSessions } = useSessions();

  /* ------------------------------------------------------------
   * Load workshop sessions
   * ------------------------------------------------------------ */
  React.useEffect(() => {
    if (selection?.type === "workshop" && selection?.item?._id) {
      loadSessions({
        from: moment().startOf("day").toDate(),
        to: moment().add(1, "month").endOf("month").toDate(),
        workshopId: selection.item._id,
      });
    }
  }, [selection, loadSessions]);

  /* ------------------------------------------------------------
   * Local booking data
   * ------------------------------------------------------------ */
  const [bookingData, setBookingData] = React.useState({
    guests: 1,
    sessionDate: "",
    sessionId: "",
    sessionLabel: "",
    price: selection?.item?.price ?? 0,
  });

  React.useEffect(() => {
    if (
      selection?.type === "workshop" &&
      selection?.sessionDate &&
      !bookingData.sessionDate
    ) {
      setBookingData((b) => ({
        ...b,
        sessionDate: selection.sessionDate,
        sessionId: selection.sessionId || "",
        ruleId: selection.ruleId || null,
        sessionLabel: moment(selection.sessionDate).format(
          "DD/MM/YYYY — HH:mm"
        ),
        studio: selection?.studio || "",
      }));
    }
  }, [selection]);

  /* ------------------------------------------------------------
   * Customer form
   * ------------------------------------------------------------ */
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
    setBookingData((b) => ({ ...b, price: basePrice * b.guests }));
  }, [bookingData.guests, selection]);

  /* ------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------ */
  const handleFormChange = (e) => {
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
      return setError("Please fill the required fields and accept the terms.");
    }

    if (selection?.type === "workshop" && !bookingData.sessionId) {
      return setError("Please select a workshop date/time before confirming.");
    }

    try {
      setSubmitting(true);

      const payload = {
        type: selection?.type,
        itemId: selection?.item?._id || selection?.item?.id,
        totalPrice: bookingData.price,
        guestCount: bookingData.guests,
        currency: selection?.currency || "ILS",
        date: bookingData.sessionDate
          ? moment(bookingData.sessionDate).utc().toISOString()
          : null,
        sessionId: bookingData.sessionId,
        ruleId: bookingData.ruleId || selection?.ruleId || null,
        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        },
      };

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

  /* ------------------------------------------------------------
   * Empty state
   * ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------ */
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "70% 30%" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* LEFT card */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Fill in your details
          </Typography>

          {selection?.type === "workshop" && (
            <Box sx={{ mb: 3 }}>
              <WorkshopDatePickerInline
                key={selection?._id || "picker"}
                guestSchedule={sessions}
                sessionDate={bookingData.sessionDate}
                onSelectDate={(date, id, session) => {
                  if (!session) {
                    return setBookingData((b) => ({
                      ...b,
                      sessionDate: date,
                      sessionId: id || "",
                      sessionLabel: "",
                    }));
                  }
                  setBookingData((b) => ({
                    ...b,
                    sessionDate: session.startLocal,
                    sessionId: id || "",
                    sessionLabel: `${moment(session.startLocal).format(
                      "DD/MM/YYYY, HH:mm"
                    )} — ${session.studio || "Studio"}`,
                    studio: session?.studio || "",
                  }));
                }}
              />
            </Box>
          )}

          {selection?.type === "room" && (
            <Box sx={{ mb: 3 }}>
              <AvailabilityBar />
            </Box>
          )}

          {/* Form grows to fill */}
          <Box sx={{ flex: 1 }}>
            <CheckoutForm
              form={form}
              bookingData={bookingData}
              error={error}
              onFormChange={handleFormChange}
              onBookingChange={handleBookingChange}
              onSubmit={handleSubmit}
              onBack={() => navigate(-1)}
            />
          </Box>
        </Paper>

        {/* RIGHT card */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BookingSummary
            sel={{ ...selection, ...bookingData }}
            onConfirm={handleSubmit}
            submitting={submitting}
          />
        </Paper>
      </Box>
    </Container>
  );
}
