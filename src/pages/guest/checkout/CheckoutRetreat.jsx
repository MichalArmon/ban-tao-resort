// 📁 src/pages/guest/checkout/CheckoutRetreat.jsx
import React, { useMemo } from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import BookingSummary from "../../../components/booking/BookingSummary";
import CheckoutForm from "../../../components/booking/CheckoutForm";

export default function CheckoutRetreat({ selection }) {
  const syncSelection = useMemo(() => {
    return {
      ...selection,
      price: selection.priceBase,
    };
  }, [selection]);

  return (
    <Container sx={{ mt: 6 }}>
      <Box
        sx={{ display: "grid", gridTemplateColumns: { md: "70% 30%" }, gap: 3 }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Retreat Booking
          </Typography>

          <CheckoutForm bookingData={syncSelection} onSubmit={() => {}} />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <BookingSummary sel={syncSelection} />
        </Paper>
      </Box>
    </Container>
  );
}
