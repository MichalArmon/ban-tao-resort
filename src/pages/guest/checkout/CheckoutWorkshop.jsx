// 📁 src/pages/guest/checkout/CheckoutWorkshop.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import moment from "moment";
import { useSessions } from "../../../context/SessionsContext";
import { useBooking } from "../../../context/BookingContext";
import WorkshopDatePickerInline from "../../../components/booking/WorkshopDatePickerInline";
import CheckoutForm from "../../../components/booking/CheckoutForm";
import BookingSummary from "../../../components/booking/BookingSummary";

export default function CheckoutWorkshop({ selection }) {
  const { sessions, loadSessions } = useSessions();
  const { createBooking, clearSelection } = useBooking();

  const [bookingData, setBookingData] = useState({
    guests: selection.guests || 1,
    sessionDate: selection.sessionDate || "",
    sessionId: selection.sessionId || "",
    sessionLabel: "",
    price: 0,
  });

  // Load all sessions of this workshop
  useEffect(() => {
    loadSessions({
      workshopId: selection.item.id,
      from: moment().startOf("day").toDate(),
      to: moment().add(1, "month").endOf("month").toDate(),
    });
  }, []);

  const syncSelection = useMemo(() => {
    const price = (selection.priceBase || 0) * (bookingData.guests || 1);

    return {
      ...selection,
      ...bookingData,
      price,
    };
  }, [selection, bookingData]);

  return (
    <Container sx={{ mt: 6 }}>
      <Box
        sx={{ display: "grid", gridTemplateColumns: { md: "70% 30%" }, gap: 3 }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Workshop Booking
          </Typography>

          <WorkshopDatePickerInline
            sessions={sessions}
            sessionDate={bookingData.sessionDate}
            guests={bookingData.guests}
            onGuestsChange={(g) => setBookingData((b) => ({ ...b, guests: g }))}
            onSelectDate={(date, id, session) => {
              setBookingData((b) => ({
                ...b,
                sessionDate: date,
                sessionId: id,
                sessionLabel: moment(date).format("DD/MM/YYYY HH:mm"),
              }));
            }}
          />

          <CheckoutForm bookingData={syncSelection} onSubmit={() => {}} />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <BookingSummary sel={syncSelection} />
        </Paper>
      </Box>
    </Container>
  );
}
