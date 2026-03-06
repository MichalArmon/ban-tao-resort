import React, { useRef } from "react";
import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import moment from "moment";

import { useBooking } from "../../context/BookingContext";
import BookingConfirmationPdf from "../../components/booking/BookingConfirmationPdf";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ThankYouPage() {
  const { lastBooking } = useBooking();
  const pdfRef = useRef();

  if (!lastBooking) {
    return <Typography sx={{ p: 4 }}>No booking found.</Typography>;
  }

  // ✅ שם מחובר – בדיוק כמו ב־guestInfo
  const booking = {
    fullName: lastBooking.guestInfo?.fullName || "Guest",
    email: lastBooking.guestInfo?.email || "",
    phone: lastBooking.guestInfo?.phone || "",

    serviceName: lastBooking.serviceName || "Booking",

    date: moment(lastBooking.date).format("DD MMM YYYY"),
    time: moment(lastBooking.date).format("HH:mm"),

    guestCount: lastBooking.guestCount,
    totalPrice: lastBooking.totalPrice,

    _id: lastBooking._id,
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;

    // clone node (בלי הבהוב)
    const clone = pdfRef.current.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.top = "-10000px";
    clone.style.left = "0";
    clone.style.opacity = "1";
    clone.style.background = "#ffffff";

    document.body.appendChild(clone);
    await new Promise((r) => requestAnimationFrame(r));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`BanTao-Booking-${booking._id}.pdf`);

    document.body.removeChild(clone);
  };
  console.log("BOOKING RAW DATA:", booking);
  console.log("LAST BOOKING FROM CONTEXT:", lastBooking);

  return (
    <Box
      sx={{
        overflow: "hidden",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/leaves-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Card */}
      <Card
        sx={{
          p: 4,
          maxWidth: 420,
          textAlign: "center",
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "white",
        }}
      >
        <CardContent>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            Thank You!
          </Typography>

          <Typography color="text.secondary" mb={3}>
            We’re truly excited to welcome you soon and share this unique
            experience with you.
            <br />
            <br />
            Your reservation has been received, and our team is preparing
            everything for your arrival.
          </Typography>

          <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<DownloadRounded />}
            sx={{ borderRadius: 2, px: 3 }}
            onClick={handleDownloadPdf}
          >
            Click Here To Download Now
          </Button>
        </CardContent>
      </Card>

      {/* PDF content (off-screen, for capture only) */}
      <Box
        ref={pdfRef}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <BookingConfirmationPdf booking={booking} />
      </Box>
    </Box>
  );
}
