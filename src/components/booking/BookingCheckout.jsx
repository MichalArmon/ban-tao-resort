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
// 🟢 ייבוא useMemo
import { useMemo } from "react";

import { useBooking } from "../../context/BookingContext";
import { useSessions } from "../../context/SessionsContext";
import WorkshopDatePickerInline from "../../components/booking/WorkshopDatePickerInline";
import BookingSummary from "../../components/booking/BookingSummary";
import CheckoutForm from "../../components/booking/CheckoutForm";
import AvailabilityBar from "../../components/booking/AvailabilityBar";
import { useRooms } from "../../context/RoomContext";
import { useDateSelection } from "../../context/DateSelectionContext";

export default function BookingCheckout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { selection, createBooking, clearSelection } = useBooking();
  const { sessions, loadSessions } = useSessions();
  const {
    rooms: roomList,
    setAvailableRooms,
    checkRoomAvailability,
  } = useRooms();
  const {
    setCheckIn,
    setCheckOut,
    setGuests,
    setRoomsCount, // 🟢 משיכת הנתונים החיים מ-AvailabilityBar (חיוני לחדרים)
    checkIn: liveCheckIn,
    checkOut: liveCheckOut,
    guests: liveGuests,
    roomsCount: liveRoomsCount,
  } = useDateSelection();
  /* ------------------------------------------------------------
   * Load workshop sessions (No change)
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
   * ROOM HYDRATION (אתחול פרטי חדר מה-selection)
   * ------------------------------------------------------------ */

  React.useEffect(() => {
    if (
      selection?.type === "room" &&
      roomList.length > 0 &&
      selection.item?.slug
    ) {
      const selectedRoom = roomList.find((r) => r.slug === selection.item.slug);

      if (selectedRoom) {
        if (selection.checkIn && selection.checkOut) {
          // 🟢 תיקון Timezone: מאתחל את התאריך כתחילת היום המקומי
          setCheckIn(moment(selection.checkIn).startOf("day"));
          setCheckOut(moment(selection.checkOut).startOf("day"));
        }

        setGuests(selection.guests || 1);
        setRoomsCount(selection.roomsCount || 1);

        const combinedRoom = {
          ...selectedRoom,
          priceBase: selection.priceBase,
          currency: selection.currency,
          availableUnits: selection.roomsCount || 1,
        };

        setAvailableRooms([combinedRoom]);
      }
    }
  }, [
    selection,
    roomList,
    setCheckIn,
    setCheckOut,
    setGuests,
    setRoomsCount,
    setAvailableRooms,
  ]);
  /* ------------------------------------------------------------
   * Local booking data (סטייט ראשי לנתוני טופס)
   * ------------------------------------------------------------ */
  const [bookingData, setBookingData] = React.useState({
    // 🟢 אתחול האורחים כערך ה-Selection, לא משנה מאיפה
    guests: selection?.guests || 1,
    sessionDate: "",
    sessionId: "",
    sessionLabel: "",
    price: 0,
  }); // --------------------------------------------------------------------- // 🟢 יצירת אובייקט Selection חי ומסונכרן + חישוב מחיר (הליבה המטפלת בסנכרון) // ---------------------------------------------------------------------

  const synchronizedSelection = useMemo(() => {
    if (!selection) return null;

    const isRoom = selection.type === "room";

    // 🎯 אורחים: חי אם חדר (מהבר), סטטי אם סדנה (מהטופס)
    const currentGuests = isRoom ? liveGuests : bookingData.guests;

    // 🎯 תאריכים: חיים אם חדר (מהבר), סטטיים אם סדנה (מה-selection)
    const currentCheckIn = isRoom
      ? liveCheckIn?.format("YYYY-MM-DD")
      : selection.checkIn;
    const currentCheckOut = isRoom
      ? liveCheckOut?.format("YYYY-MM-DD")
      : selection.checkOut;

    let calculatedPrice = 0;
    const basePrice = selection?.priceBase || 0;

    if (isRoom) {
      // ✅ חישוב חדרים: מחיר * לילות
      const nights =
        liveCheckOut && liveCheckIn
          ? liveCheckOut.diff(liveCheckIn, "days")
          : 0;
      calculatedPrice = basePrice * (nights > 0 ? nights : 1);
    } else {
      // ✅ חישוב סדנאות: מחיר * אורחים
      calculatedPrice = basePrice * currentGuests;
    }

    // 🟢 החזרת אובייקט selection מעודכן לסיכום ולשליחה
    return {
      ...selection,
      guests: currentGuests,
      checkIn: currentCheckIn,
      checkOut: currentCheckOut,
      price: calculatedPrice,
    };
    // 🟢 התלויות: מופעל כאשר הטופס (bookingData.guests) או הבר (live...) משתנים
  }, [selection, bookingData.guests, liveGuests, liveCheckIn, liveCheckOut]);
  /* ------------------------------------------------------------
   * עדכון bookingData לטופס (מחישובים חיצוניים)
   * ------------------------------------------------------------ */

  React.useEffect(() => {
    if (
      synchronizedSelection?.price !== bookingData.price ||
      synchronizedSelection?.guests !== bookingData.guests
    ) {
      setBookingData((b) => ({
        ...b,
        price: synchronizedSelection?.price || 0, // 🎯 עבור סדנאות: נעדכן רק את המחיר (guests נשלט על ידי הטופס עצמו) // עבור חדרים: המחיר והאורחים (liveGuests) מעודכנים בבת אחת
        guests: synchronizedSelection?.guests || b.guests,
      }));
    }
  }, [synchronizedSelection]); // הסרנו את התלות ב-selection.type כי היא כבר בתוך synchronizedSelection // ... (useEffect ל-workshop date נשאר זהה)

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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    // 🟢 שינוי קטן: ודא ש-guests נשמר כמספר
    if (name === "guests") {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 1) {
        setBookingData((b) => ({ ...b, [name]: numValue }));
      }
    } else {
      setBookingData((b) => ({ ...b, [name]: value }));
    }
  };
  /* ------------------------------------------------------------
   * handleSubmit (שליחת נתונים ל-Backend) - מתוקן סופית
   * ------------------------------------------------------------ */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const currentSel = synchronizedSelection || selection;

    if (!form.firstName || !form.lastName || !form.email || !form.agree) {
      return setError("Please fill the required fields and accept the terms.");
    }

    if (currentSel?.type === "workshop" && !bookingData.sessionId) {
      return setError("Please select a workshop date/time before confirming.");
    }

    if (bookingData.price <= 0 && currentSel?.priceBase > 0) {
      return setError(
        "Price calculation failed. Please check your dates and try again."
      );
    }

    try {
      setSubmitting(true);

      let payload = {
        type: currentSel?.type,
        itemId: currentSel?.item?._id || currentSel?.item?.id,
        totalPrice: bookingData.price,
        guestCount: bookingData.guests,
        currency: currentSel?.currency || "USD", // 🟢 שליחת תאריכים לפי פורמט ה-Backend (checkInDate/checkOutDate)
        ...(currentSel?.type === "room"
          ? {
              checkInDate: moment(currentSel.checkIn).utc().toISOString(),
              checkOutDate: moment(currentSel.checkOut).utc().toISOString(),
              date: moment(currentSel.checkIn).utc().toISOString(),
            }
          : {
              date: bookingData.sessionDate
                ? moment(bookingData.sessionDate).utc().toISOString()
                : null,
              sessionId: bookingData.sessionId,
            }),
        ruleId: bookingData.ruleId || currentSel?.ruleId || null,
        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        },
      }; // 🔴 ניקוי שדות לא רלוונטיים / ריקים אם הם נוצרו בטעות

      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

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
   * Empty state (No change)
   * ------------------------------------------------------------ */

  if (!selection)
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
               {" "}
        <Alert severity="warning">
                    No selection provided. Please choose an item and click BOOK
          again.        {" "}
        </Alert>
               {" "}
        <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back        {" "}
        </Button>
             {" "}
      </Container>
    );
  /* ------------------------------------------------------------
   * Render (No change in structure) - נשאר זהה
   * ------------------------------------------------------------ */

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
           {" "}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "70% 30%" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
               {" "}
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
                   {" "}
          <Typography variant="h5" gutterBottom>
                        Fill in your details          {" "}
          </Typography>
                   {" "}
          {selection?.type === "workshop" && (
            <Box sx={{ mb: 3 }}>
                           {" "}
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
                         {" "}
            </Box>
          )}
                   {" "}
          {selection?.type === "room" && (
            <Box sx={{ mb: 3 }}>
                            <AvailabilityBar />           {" "}
            </Box>
          )}
                   {" "}
          <Box sx={{ flex: 1 }}>
                       {" "}
            <CheckoutForm
              form={form} // 🟢 מעביר את הנתונים המסונכרנים ל-CheckoutForm
              bookingData={{ ...bookingData, ...synchronizedSelection }}
              error={error}
              onFormChange={handleFormChange}
              onBookingChange={handleBookingChange}
              onSubmit={handleSubmit}
              onBack={() => navigate(-1)}
            />
                     {" "}
          </Box>
                 {" "}
        </Paper>
               {" "}
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
                   {" "}
          <BookingSummary
            sel={synchronizedSelection}
            onConfirm={handleSubmit}
            submitting={submitting}
          />
                 {" "}
        </Paper>
             {" "}
      </Box>
         {" "}
    </Container>
  );
}
