// 📁 src/pages/guest/checkout/CheckoutTreatment.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

import BookingSummary from "../../../components/booking/BookingSummary";
import CheckoutForm from "../../../components/booking/CheckoutForm";
import { useTreatments } from "../../../context/TreatmentsContext";
import { useUser } from "../../../context/UserContext";
import { useBooking } from "../../../context/BookingContext";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";

export default function CheckoutTreatment({ selection }) {
  const { createBooking, clearSelection } = useBooking();
  const navigate = useNavigate();

  const { getTreatment } = useTreatments();

  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useUser();

  /* --------------------------------------------------
     👤 Form data (קשור למשתמש / אורח)
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
     🟢 Prefill מה־UserContext
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

  const treatmentId = selection?.item?.id;
  const sessionId = selection?.sessionId;

  /* -------------------------------
     טעינת טיפול
  -------------------------------- */
  useEffect(() => {
    if (!treatmentId) {
      setError("Missing treatment id");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const doc = await getTreatment(treatmentId);
        setTreatment(doc);
      } catch (e) {
        console.error("Failed to load treatment", e);
        setError("Failed to load treatment");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [treatmentId, getTreatment]);

  /* -------------------------------
     מצבי טעינה / שגיאה
  -------------------------------- */
  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !treatment || !sessionId) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">
          Something went wrong. Please go back and try again.
        </Alert>
      </Container>
    );
  }

  /* -------------------------------
     Selection מלא לצ׳קאאוט
  -------------------------------- */
  const fullSelection = {
    ...selection,
    type: "treatment",

    item: {
      id: treatment._id,
      slug: treatment.slug || null,
      title: treatment.title,
      hero:
        typeof treatment.hero === "string"
          ? treatment.hero
          : treatment.hero?.url || treatment.hero?.secure_url || null,
      priceBase: treatment.price,
      currency: treatment.currency || "USD",
      duration: treatment.duration,
      location: treatment.location || "On site",
    },

    priceBase: treatment.price,
    price: treatment.price,
    currency: treatment.currency || "USD",
  };

  /* -------------------------------
     Handlers
  -------------------------------- */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
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

      if (!selection?.sessionStart) {
        throw new Error("Missing session start time");
      }

      const payload = {
        type: "treatment",
        itemId: treatment._id,
        sessionId: selection.sessionId,
        serviceName: treatment.title,

        // 👈 השדה הקריטי! Date מלא (תאריך + שעה)
        date: new Date(selection.sessionStart),

        guestCount: 1,
        totalPrice: fullSelection.price,

        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone || "",
        },
      };

      console.log("📦 BOOKING PAYLOAD:", payload);

      await createBooking(payload);

      clearSelection();
      navigate("/resort/guest/thank-you");
    } catch (err) {
      console.error("❌ Treatment booking failed", err);
      alert("Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.agree) {
      alert("Please agree to the terms");
      return;
    }

    handleConfirm();
  };

  /* -------------------------------
     רינדור
  -------------------------------- */
  return (
    <Container sx={{ mt: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "70% 30%" },
          gap: 3,
        }}
      >
        {/* טופס */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Treatment Booking
          </Typography>

          <CheckoutForm
            form={form}
            bookingData={fullSelection}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
            onBack={() => window.history.back()}
          />
        </Paper>

        {/* סיכום */}
        <Paper sx={{ p: 3 }}>
          <BookingSummary
            sel={fullSelection}
            submitting={submitting}
            onConfirm={handleSubmit}
          />
        </Paper>
      </Box>
    </Container>
  );
}
