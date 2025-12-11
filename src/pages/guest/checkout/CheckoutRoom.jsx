// 📁 src/pages/guest/checkout/CheckoutRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import moment from "moment";
import { useRooms } from "../../../context/RoomContext";
import { useDateSelection } from "../../../context/DateSelectionContext";
import { useBooking } from "../../../context/BookingContext";
import AvailabilityBar from "../../../components/booking/AvailabilityBar";
import CheckoutForm from "../../../components/booking/CheckoutForm";
import BookingSummary from "../../../components/booking/BookingSummary";

export default function CheckoutRoom({ selection }) {
  const { rooms, setAvailableRooms } = useRooms();
  const {
    setCheckIn,
    setCheckOut,
    setGuests,
    setRoomsCount,
    checkIn,
    checkOut,
    guests,
    roomsCount,
  } = useDateSelection();

  const { createBooking, clearSelection } = useBooking();

  const [bookingData, setBookingData] = useState({
    guests: selection.guests || 1,
    price: 0,
  });

  // 🟢 Sync selected room data
  useEffect(() => {
    const selectedRoom = rooms.find((r) => r.slug === selection.item.slug);
    if (selectedRoom) {
      if (selection.checkIn) setCheckIn(moment(selection.checkIn));
      if (selection.checkOut) setCheckOut(moment(selection.checkOut));
      setGuests(selection.guests || 1);
      setRoomsCount(selection.roomsCount || 1);

      setAvailableRooms([
        {
          ...selectedRoom,
          priceBase: selection.priceBase,
          currency: selection.currency,
        },
      ]);
    }
  }, [selection, rooms]);

  // 🧮 Price calculation
  const syncSelection = useMemo(() => {
    const nights = checkOut && checkIn ? checkOut.diff(checkIn, "days") : 1;

    const price = (selection.priceBase || 0) * nights;

    return {
      ...selection,
      guests,
      roomsCount,
      checkIn: checkIn?.format("YYYY-MM-DD"),
      checkOut: checkOut?.format("YYYY-MM-DD"),
      price,
    };
  }, [selection, checkIn, checkOut, guests, roomsCount]);

  return (
    <Container sx={{ mt: 6 }}>
      <Box
        sx={{ display: "grid", gridTemplateColumns: { md: "70% 30%" }, gap: 3 }}
      >
        {/* LEFT */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Room Booking
          </Typography>
          <AvailabilityBar />

          <CheckoutForm bookingData={syncSelection} onSubmit={() => {}} />
        </Paper>

        {/* RIGHT */}
        <Paper sx={{ p: 3 }}>
          <BookingSummary sel={syncSelection} />
        </Paper>
      </Box>
    </Container>
  );
}
