import React, { useEffect, useMemo, useState } from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import moment from "moment";

import { useSessions } from "../../../context/SessionsContext";
import { useBooking } from "../../../context/BookingContext";
import { useUser } from "../../../context/UserContext";

import WorkshopDatePickerInline from "../../../components/booking/WorkshopDatePickerInline";
import CheckoutForm from "../../../components/booking/CheckoutForm";
import BookingSummary from "../../../components/booking/BookingSummary";
import { useNavigate } from "react-router-dom";

export default function CheckoutWorkshop({ selection }) {
  const navigate = useNavigate();
  const { sessions, loadSessions } = useSessions();
  const { createBooking, clearSelection } = useBooking();
  const { user } = useUser();

  /* --------------------------------------------------
     🧾 Workshop booking data
  -------------------------------------------------- */
  const [bookingData, setBookingData] = useState({
    guests: selection?.guests || 1,

    // 🟤 לצביעה בלוח
    sessionDate: selection?.sessionStart
      ? moment(selection.sessionStart).format("YYYY-MM-DD")
      : "",

    // 🟤 לבוקינג / שרת / סיכום
    sessionStart: selection?.sessionStart || "",

    sessionId: selection?.sessionId || "",
  });

  /* --------------------------------------------------
     👤 Guest / user form
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

  const [submitting, setSubmitting] = useState(false);

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
     📅 Load workshop sessions
  -------------------------------------------------- */
  useEffect(() => {
    if (!selection?.item?.id) return;

    loadSessions({
      workshopId: selection.item.id,
      from: moment().startOf("day").toDate(),
      to: moment().add(1, "month").endOf("month").toDate(),
    });
  }, [selection?.item?.id, loadSessions]);

  /* --------------------------------------------------
     💰 Price calculation
  -------------------------------------------------- */
  const totalPrice = useMemo(() => {
    return (selection?.priceBase || 0) * bookingData.guests;
  }, [selection, bookingData.guests]);

  /* --------------------------------------------------
     🧾 Summary mapping (NEW MODE)
  -------------------------------------------------- */
  const summary = useMemo(() => {
    return {
      title: selection?.item?.title || "Workshop",
      image: selection?.item?.hero,
      dateLine: bookingData.sessionStart
        ? moment(bookingData.sessionStart).format("DD/MM/YYYY HH:mm")
        : "Select date & time",
      guests: bookingData.guests,
      location: selection?.item?.location || "On site",
      price: totalPrice,
      currency: selection?.currency || "USD",
    };
  }, [selection, bookingData.sessionStart, bookingData.guests, totalPrice]);

  /* --------------------------------------------------
     📝 Handlers
  -------------------------------------------------- */
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConfirm = async () => {
    if (!user) {
      alert("Please login to complete your booking");
      navigate("/resort/login");
      return;
    }

    try {
      setSubmitting(true);

      if (!bookingData.sessionStart || !bookingData.sessionId) {
        throw new Error("Missing workshop session");
      }

      const payload = {
        type: "workshop",
        itemId: selection.item.id,
        sessionId: bookingData.sessionId,
        serviceName: selection.item.title,

        // 👈 בדיוק כמו בטיפולים – Date מלא
        date: new Date(bookingData.sessionStart),

        guestCount: bookingData.guests,
        totalPrice: totalPrice,

        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone || "",
        },
      };

      console.log("📦 WORKSHOP BOOKING PAYLOAD:", payload);

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
      console.error("❌ Workshop booking failed", err);
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
            Workshop Booking
          </Typography>
          <WorkshopDatePickerInline
            sessions={sessions}
            sessionDate={bookingData.sessionDate} // ✅ רק יום
            onSelectDate={(value, id, session) => {
              if (!session) {
                // 🟡 נבחר יום בלבד
                setBookingData((b) => ({
                  ...b,
                  sessionDate: value, // YYYY-MM-DD
                  sessionStart: "",
                  sessionId: "",
                }));
                return;
              }

              // 🟢 נבחרה שעה
              setBookingData((b) => ({
                ...b,
                sessionDate: moment(session.startLocal).format("YYYY-MM-DD"),
                sessionStart: session.startLocal,
                sessionId: id,
              }));
            }}
          />

          <CheckoutForm
            form={form}
            bookingData={{ guests: bookingData.guests }}
            onFormChange={handleFormChange}
          />
        </Paper>

        {/* RIGHT */}
        <Paper sx={{ p: 3 }}>
          <BookingSummary
            summary={summary}
            onConfirm={handleConfirm}
            submitting={submitting}
          />
        </Paper>
      </Box>
    </Container>
  );
}
