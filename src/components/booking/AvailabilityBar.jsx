import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stack, Button, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

// 🔑 ייבוא Hooks ורכיבים חיוניים
import { useBooking } from "../../context/BookingContext";
import GuestRoomPopover from "./GuestRoomPopover";
import { styled } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add"; // לוודא שמיובא אם משתמשים בו
import RemoveIcon from "@mui/icons-material/Remove"; // לוודא שמיובא אם משתמשים בו

const AvailabilityBar = () => {
  // 🔑 שליפת המשתנים והפונקציות מה-Context
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    rooms,
    setRooms,
    fetchAvailability,
    loading,
    fetchMonthlyRetreatsMap,
    fetchRetreatsCalendar,
  } = useBooking();

  // 🛑 1. הסרת הקונפליקט: נשתמש ב-checkIn כ-source of truth לחודש
  const [retreatDates, setRetreatDates] = useState({});

  // 💡 חישוב תלותי: minCheckOut תלוי ב-checkIn
  const minCheckIn = dayjs().startOf("day");
  const minCheckOut = useMemo(
    () => (checkIn ? dayjs(checkIn).add(1, "day") : minCheckIn.add(1, "day")),
    [checkIn, minCheckIn]
  );

  // 🔑 2. Effect לטעינת נתונים: תלוי רק ב-checkIn (מופעל בטעינה ובשינוי checkIn)
  useEffect(() => {
    (async () => {
      const map = await fetchRetreatsCalendar(24);
      setRetreatDates(map); // map = { "2025-10-15": { type:"yoga", name:"..." }, ... }
      console.log("calendar loaded days:", Object.keys(map).length);
    })();
  }, [fetchRetreatsCalendar]);

  // ✅ CustomDay בתוך הקומפוננטה כדי שיקבל retreatDates מה-closure
  const CustomDay = (props) => {
    const { day, className, ...rest } = props;

    // הגנה
    if (!day || !dayjs.isDayjs(day))
      return <PickersDay {...rest} day={day} className={className} />;

    const key = day.format("YYYY-MM-DD");
    const info = retreatDates[key]; // 👈 משתמשים במפה מהשרת
    const type = info?.type?.toLowerCase();

    // צבעים לפי סוג
    const colors = {
      yoga: "rgba(76,175,80,0.15)",
      detox: "rgba(33,150,243,0.15)",
      meditation: "rgba(156,39,176,0.15)",
      workshop: "rgba(255,152,0,0.18)",
    };

    const bg = type ? colors[type] : "transparent";
    const hoverBg = type ? colors[type].replace("0.15", "0.25") : "inherit";

    // דיבוג נקודתי ליום שאת מצפה שיצבע
    if (key === "2025-10-15") console.log("DBG 15th ->", info);

    return (
      <PickersDay
        {...rest} // חשוב: משמר את כל ה-handlers הפנימיים של MUI
        day={day}
        className={className}
        title={info?.name || info?.type}
        sx={{
          backgroundColor: bg,
          borderRadius: "50%",
          "&:hover": { backgroundColor: hoverBg },
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          },
        }}
      />
    );
  };

  // ... (פונקציות עזר handleSetGuests, handleSetRooms נשארות כצפוי)
  const handleSetGuests = useCallback(
    (value) => setGuests(Math.max(1, value)),
    [setGuests]
  );
  const handleSetRooms = useCallback(
    (value) => setRooms(Math.max(1, value)),
    [setRooms]
  );
  const maxGuests = rooms * 4;
  const minGuests = rooms * 1;

  // 3. הגדרת הפונקציה לחיפוש (משתמשת ב-State עדכני)
  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    await fetchAvailability();
  };

  // 4. ולידציה לכפתור
  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    dayjs(checkOut).isSameOrBefore(dayjs(checkIn), "day");

  const today = useMemo(() => dayjs().startOf("day"), []);
  const farFuture = useMemo(() => dayjs().add(3, "year").endOf("day"), []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          width: "100%",
          gap: 2,
          alignItems: "center",
          p: 3,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 2,
          mb: 4,
          backgroundColor: "background.paper",
          boxShadow: 3,
          justifyContent: "center",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        {/* Check-In */}
        <DatePicker
          label="Check-In"
          value={checkIn ? dayjs(checkIn) : null}
          onChange={(newValue) =>
            setCheckIn(newValue ? newValue.format("YYYY-MM-DD") : "")
          }
          minDate={minCheckIn}
          maxDate={farFuture} // 🛑 farFuture צריך להיות מוגדר בראש הקומפוננטה או להגיע מה-Context
          // 🛑 מחיקת onMonthChange – לא נחוץ! ה-useEffect תלוי ב-checkIn
          // onMonthChange={(newDate) => setCurrentMonth(newDate)}

          slots={{ day: CustomDay }}
          slotProps={{
            textField: { size: "medium", InputLabelProps: { shrink: true } },
            popper: { disablePortal: true },
          }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 240 } }}
        />

        {/* Check-Out */}
        <DatePicker
          label="Check-Out"
          value={checkOut ? dayjs(checkOut) : null}
          onChange={(newValue) =>
            setCheckOut(newValue ? newValue.format("YYYY-MM-DD") : "")
          }
          minDate={minCheckIn}
          maxDate={farFuture}
          // 🛑 מחיקת onMonthChange
          // onMonthChange={(newDate) => setCurrentMonth(newDate)}
          slots={{ day: CustomDay }}
          slotProps={{
            textField: { size: "medium", InputLabelProps: { shrink: true } },
            popper: { disablePortal: true, sx: { zIndex: 2000 } },
          }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 240 } }}
        />

        {/* Guests & Rooms */}
        <GuestRoomPopover
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 260 } }}
          guests={guests}
          rooms={rooms}
          setGuests={handleSetGuests}
          setRooms={handleSetRooms}
        />

        {/* Search */}
        <Button
          variant="contained"
          size="large"
          disabled={isSearchDisabled || loading}
          onClick={handleSearch}
          sx={{ width: 140, height: 56, flexShrink: 0 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

export default AvailabilityBar;
