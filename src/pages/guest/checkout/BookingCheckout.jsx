// 📁 src/pages/guest/checkout/BookingCheckout.jsx
import React from "react";
import { useBooking } from "../../../context/BookingContext";
import CheckoutRoom from "./CheckoutRoom";
import CheckoutWorkshop from "./CheckoutWorkshop";
import CheckoutRetreat from "./CheckoutRetreat";
import { Container, Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BookingCheckout() {
  const { selection } = useBooking();
  const navigate = useNavigate();

  if (!selection) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="warning">
          No selection found. Please choose again.
        </Alert>
        <Button onClick={() => navigate(-1)} variant="contained">
          Go Back
        </Button>
      </Container>
    );
  }

  switch (selection.type) {
    case "room":
      return <CheckoutRoom selection={selection} />;
    case "workshop":
      return <CheckoutWorkshop selection={selection} />;
    case "retreat":
      return <CheckoutRetreat selection={selection} />;
    default:
      return (
        <Container sx={{ py: 6 }}>
          <Alert severity="error">Unknown booking type.</Alert>
        </Container>
      );
  }
}
