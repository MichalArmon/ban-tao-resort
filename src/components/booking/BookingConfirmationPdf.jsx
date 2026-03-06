import React from "react";
import { Box, Typography, Divider } from "@mui/material";

/**
 * BookingConfirmationPdf
 * מציג קבלה / אישור הזמנה כ־PDF
 * מציג אך ורק מידע שמגיע מה־booking (payload שנשמר)
 */
export default function BookingConfirmationPdf({ booking }) {
  if (!booking) return null;

  return (
    <Box
      sx={{
        width: "210mm", // A4
        minHeight: "297mm",
        padding: "24mm",
        backgroundColor: "#fff",
        color: "#000",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Ban Tao Village
        </Typography>
        <Typography variant="subtitle1">Reservation Confirmation</Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Guest Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Guest Details
        </Typography>

        <Typography>
          <b>Name:</b> {booking.fullName}
        </Typography>

        <Typography>
          <b>Email:</b> {booking.email}
        </Typography>

        {booking.phone && (
          <Typography>
            <b>Phone:</b> {booking.phone}
          </Typography>
        )}
      </Box>

      {/* Booking Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Booking Details
        </Typography>

        <Typography>
          <b>Service:</b> {booking.serviceName}
        </Typography>

        <Typography>
          <b>Date:</b> {booking.date}
        </Typography>

        <Typography>
          <b>Time:</b> {booking.time}
        </Typography>

        <Typography>
          <b>Guests:</b> {booking.guestCount}
        </Typography>

        <Typography>
          <b>Total Price:</b> ${booking.totalPrice}
        </Typography>

        <Typography>
          <b>Booking ID:</b> {booking._id}
        </Typography>
      </Box>

      <Divider sx={{ mt: 6, mb: 2 }} />

      {/* Footer */}
      <Typography variant="body2" color="text.secondary">
        Thank you for choosing Ban Tao Village.
        <br />
        We look forward to welcoming you.
      </Typography>
    </Box>
  );
}
