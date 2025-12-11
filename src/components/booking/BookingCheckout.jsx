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
import { useMemo } from "react";
import { useBooking } from "../../context/BookingContext";
import { useSessions } from "../../context/SessionsContext";
import WorkshopDatePickerInline from "../../components/booking/WorkshopDatePickerInline";
import BookingSummary from "../../components/booking/BookingSummary";
import CheckoutForm from "../../components/booking/CheckoutForm";
import AvailabilityBar from "../../components/booking/AvailabilityBar";
import { useRooms } from "../../context/RoomContext";
import { useDateSelection } from "../../context/DateSelectionContext";
import { useUser } from "../../context/UserContext";

export default function BookingCheckout() {
  const { user } = useUser();
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
    setRoomsCount,
    checkIn: liveCheckIn,
    checkOut: liveCheckOut,
    guests: liveGuests,
    roomsCount: liveRoomsCount,
  } = useDateSelection();

  React.useEffect(() => {
    if (selection?.type === "workshop" && selection?.item?._id) {
      loadSessions({
        from: moment().startOf("day").toDate(),
        to: moment().add(1, "month").endOf("month").toDate(),
        workshopId: selection.item._id,
      });
    }
  }, [selection, loadSessions]);

  const selectedFullRoom =
    roomList?.find((r) => r.slug === selection?.item?.slug) || selection?.item;
  const [bookingData, setBookingData] = React.useState({
    guests: selection?.type === "room" ? liveGuests : selection?.guests || 1,
    sessionDate: "",
    sessionId: "",
    sessionLabel: "",
    price: 0,
  });

  React.useEffect(() => {
    if (
      selection?.type === "room" &&
      roomList.length > 0 &&
      selection.item?.slug
    ) {
      const selectedRoom = roomList.find((r) => r.slug === selection.item.slug);
      if (selectedRoom) {
        if (selection.checkIn && selection.checkOut) {
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

  const synchronizedSelection = useMemo(() => {
    if (!selection) return null;

    const isRoom = selection.type === "room"; // ✅ משתמש באורחים החיים הנכונים

    const currentGuests = isRoom ? liveGuests : bookingData.guests; // ⚠️ חשוב: אנו משתמשים ב-CheckIn/Out רק לחדרים, ולכן לא דורסים את זה כאן לסדנאות. // שימו לב שהתאריכים הרגילים (checkIn/Out) עדיין מוגדרים כאן רק מ Live

    const currentCheckIn = liveCheckIn?.format("YYYY-MM-DD");
    const currentCheckOut = liveCheckOut?.format("YYYY-MM-DD");

    const basePrice = selection?.priceBase || 0;
    let calculatedPrice = 0;

    if (isRoom) {
      const nights =
        liveCheckOut && liveCheckIn
          ? liveCheckOut.diff(liveCheckIn, "days")
          : 0;
      calculatedPrice = basePrice * (nights > 0 ? nights : 1);
    } else {
      // סדנאות — המחיר לפי כמות אורחים
      calculatedPrice = basePrice * (currentGuests || 1);
    }

    return {
      ...selection,
      guests: currentGuests,
      checkIn: currentCheckIn,
      checkOut: currentCheckOut,
      price: calculatedPrice,

      // 🟢 הוספה קריטית: דורסים את פרטי הסשן של הסדנה מה-State החי (bookingData)
      // זה הופך את התאריך/שעה לעדכני ב-BookingSummary
      sessionDate: bookingData.sessionDate || selection.sessionDate,
      sessionId: bookingData.sessionId || selection.sessionId,
      sessionLabel: bookingData.sessionLabel || selection.sessionLabel,
    };
  }, [
    selection,
    liveGuests,
    liveCheckIn,
    liveCheckOut,
    bookingData.guests,
    // 🟢 הוספת תלויות: חובה לכלול את שדות הסשן כדי שה-useMemo ירוץ מחדש
    bookingData.sessionDate,
    bookingData.sessionId,
    bookingData.sessionLabel,
  ]);

  React.useEffect(() => {
    if (
      selection?.type === "workshop" &&
      selection?.sessionDate &&
      !bookingData.sessionDate
    ) {
      setBookingData((b) => ({
        ...b,
        sessionDate: selection.sessionDate,
        sessionId: selection.sessionId || "",
        ruleId: selection.ruleId || null,
        sessionLabel: moment(selection.sessionDate).format(
          "DD/MM/YYYY — HH:mm"
        ),
        studio: selection?.studio || "",
      }));
    }
  }, [selection, bookingData.sessionDate]);

  React.useEffect(() => {
    if (
      synchronizedSelection?.price !== bookingData.price ||
      synchronizedSelection?.guests !== bookingData.guests
    ) {
      setBookingData((b) => ({
        ...b,
        price: synchronizedSelection?.price || 0,
        guests: synchronizedSelection?.guests || b.guests,
      }));
    }
  }, [synchronizedSelection]);

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

  // 🟢 טעינת פרטי משתמש אל תוך הטופס
  React.useEffect(() => {
    if (!user?._id) return;

    setForm((prev) => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      zip: user.zip || "",
      country: user.country || "Israel",
    }));
  }, [user]);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((b) => ({ ...b, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const currentSel = synchronizedSelection || selection;
    if (!form.firstName || !form.lastName || !form.email || !form.agree)
      return setError("Please fill the required fields and accept the terms.");
    if (currentSel?.type === "workshop" && !bookingData.sessionId)
      return setError("Please select a workshop date/time before confirming.");
    if (bookingData.price <= 0 && currentSel?.priceBase > 0)
      return setError(
        "Price calculation failed. Please check your dates and try again."
      );
    try {
      setSubmitting(true);
      const payload = {
        type: currentSel?.type,
        itemId: currentSel?.item?._id || currentSel?.item?.id,
        totalPrice: bookingData.price,
        guestCount: bookingData.guests,
        currency: currentSel?.currency || "USD",

        // 🏠 אם מדובר בחדר — שולחים checkInDate ו-checkOutDate
        checkInDate:
          currentSel?.type === "room"
            ? moment(currentSel.checkIn).utc().toISOString()
            : null,
        checkOutDate:
          currentSel?.type === "room"
            ? moment(currentSel.checkOut).utc().toISOString()
            : null,

        // 🎟️ אם מדובר בסדנה — שולחים date אחד (sessionDate)
        date:
          currentSel?.type === "workshop" && bookingData.sessionDate
            ? moment(bookingData.sessionDate).utc().toISOString()
            : null,

        sessionId: bookingData.sessionId,
        ruleId: bookingData.ruleId || currentSel?.ruleId || null,

        guestInfo: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          notes: form.notes,
        },
      };
      // 🧹 מנקה שדות ריקים לפני השליחה
      Object.keys(payload).forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        }
      });

      const newBooking = await createBooking(payload);
      clearSelection();
      navigate("/resort/guest/thank-you", {
        state: { booking: newBooking, customer: form },
      });
    } catch (err) {
      console.error("❌ Booking failed:", err);
      setError(err?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!selection)
    return (
      <Container maxWidth="lg" sx={{ py: 6, mt: 4 }}>
        <Alert severity="warning">
          No selection provided. Please choose an item and click BOOK again.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, mt: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "70% 30%" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
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
          <Typography variant="h5" gutterBottom>
            Fill in your details
          </Typography>
          {selection?.type === "workshop" && (
            <Box sx={{ mb: 3 }}>
              <WorkshopDatePickerInline
                key={selection?._id || "picker"}
                sessions={sessions}
                sessionDate={bookingData.sessionDate}
                guests={bookingData.guests}
                onGuestsChange={(val) =>
                  setBookingData((b) => ({ ...b, guests: val }))
                }
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
            </Box>
          )}
          {selection?.type === "room" && (
            <Box sx={{ mb: 3 }}>
              <AvailabilityBar />
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <CheckoutForm
              form={form}
              bookingData={{ ...bookingData, ...synchronizedSelection }}
              error={error}
              onFormChange={handleFormChange}
              onBookingChange={handleBookingChange}
              onSubmit={handleSubmit}
              onBack={() => navigate(-1)}
            />
          </Box>
        </Paper>
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
          <BookingSummary
            sel={synchronizedSelection}
            onConfirm={handleSubmit}
            submitting={submitting}
            guestsOverride={bookingData.guests}
          />
        </Paper>
      </Box>
    </Container>
  );
}
