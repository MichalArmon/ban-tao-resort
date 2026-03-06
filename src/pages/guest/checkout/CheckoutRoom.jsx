// 📁 src/pages/guest/checkout/CheckoutRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import { useRooms } from "../../../context/RoomContext";
import { useDateSelection } from "../../../context/DateSelectionContext";
import { useBooking } from "../../../context/BookingContext";
import { useUser } from "../../../context/UserContext";

import AvailabilityBar from "../../../components/booking/AvailabilityBar";
import CheckoutForm from "../../../components/booking/CheckoutForm";
import BookingSummary from "../../../components/booking/BookingSummary";

export default function CheckoutRoom({ selection }) {
  const navigate = useNavigate();

  const { user } = useUser();
  const { rooms, setAvailableRooms } = useRooms();
  const { createBooking, clearSelection } = useBooking();

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

  const [submitting, setSubmitting] = useState(false);

  /* --------------------------------------------------
     👤 Guest form
  -------------------------------------------------- */
  const [form, setForm] = useState({
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

  /* --------------------------------------------------
     🟢 Prefill from user
  -------------------------------------------------- */
  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || user.name?.first || "",
      lastName: prev.lastName || user.name?.last || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  /* --------------------------------------------------
     🏨 Sync selected room into DateSelectionContext
  -------------------------------------------------- */
  useEffect(() => {
    if (!selection?.item?.slug) return;

    const selectedRoom = rooms.find((r) => r.slug === selection.item.slug);
    if (!selectedRoom) return;

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
  }, [
    selection,
    rooms,
    setAvailableRooms,
    setCheckIn,
    setCheckOut,
    setGuests,
    setRoomsCount,
  ]);

  /* --------------------------------------------------
     💰 Price calculation
  -------------------------------------------------- */
  const syncSelection = useMemo(() => {
    const nights =
      checkIn && checkOut ? Math.max(checkOut.diff(checkIn, "days"), 1) : 1;

    const price = (selection.priceBase || 0) * nights;

    return {
      ...selection,
      type: "room",
      guests,
      roomsCount,
      checkIn: checkIn?.format("YYYY-MM-DD"),
      checkOut: checkOut?.format("YYYY-MM-DD"),
      price,
      currency: selection.currency || "USD",
    };
  }, [selection, checkIn, checkOut, guests, roomsCount]);

  /* --------------------------------------------------
     📝 Handlers
  -------------------------------------------------- */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* --------------------------------------------------
     ✅ CONFIRM ROOM BOOKING
  -------------------------------------------------- */
  const handleConfirmRoom = async () => {
    if (!user) {
      alert("Please login to complete your booking");
      navigate("/resort/login");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!form.agree) {
      alert("Please agree to the terms");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        type: "room",
        itemId: selection.item.id || selection.item._id,

        checkInDate: moment(checkIn).startOf("day").toISOString(),
        checkOutDate: moment(checkOut).startOf("day").toISOString(),

        guestCount: guests,
        totalPrice: syncSelection.price,

        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone || "",
          notes: form.notes || "",
        },
      };

      console.log("📦 ROOM BOOKING PAYLOAD:", payload);

      const newBooking = await createBooking(payload);

      clearSelection();

      navigate("/resort/guest/thank-you", {
        state: {
          booking: newBooking,
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
          },
        },
      });
    } catch (err) {
      console.error("❌ Room booking failed", err);
      alert("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------------------------
     🖥️ Render
  -------------------------------------------------- */
  return (
    <Container sx={{ mt: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "70% 30%" },
          gap: 3,
        }}
      >
        {/* LEFT */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Room Booking
          </Typography>

          <AvailabilityBar />

          <CheckoutForm
            form={form}
            bookingData={syncSelection}
            onFormChange={handleFormChange}
            onSubmit={handleConfirmRoom}
            onBack={() => window.history.back()}
          />
        </Paper>

        {/* RIGHT */}
        <Paper sx={{ p: 3 }}>
          <BookingSummary
            sel={syncSelection}
            onConfirm={handleConfirmRoom}
            submitting={submitting}
          />
        </Paper>
      </Box>
    </Container>
  );
}
