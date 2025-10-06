import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stack, Button, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useNavigate } from "react-router-dom";
dayjs.extend(isSameOrBefore);

// 🔑 ייבוא Hooks ורכיבים חיוניים
import { useBooking } from "../../context/BookingContext";
import GuestRoomPopover from "./GuestRoomPopover";

const AvailabilityBar = () => {
  // 🔗 שליפת המשתנים והפונקציות מה-Context
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
    fetchRetreatsCalendar,
  } = useBooking();

  const navigate = useNavigate();

  // 📅 לוח ריטריטים: { "YYYY-MM-DD": { type, name, slug? } }
  const [retreatDates, setRetreatDates] = useState({});

  // 🗓️ קבועי תאריכים (ממואיזים)
  const minCheckIn = useMemo(() => dayjs().startOf("day"), []);
  const farFuture = useMemo(() => dayjs().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? dayjs(checkIn).add(1, "day") : minCheckIn.add(1, "day")),
    [checkIn, minCheckIn]
  );

  // ✨ מחולל slug אחיד ל-URL
  const makeSlug = useCallback((info, key) => {
    const base = (
      info?.slug ||
      info?.name ||
      info?.type ||
      key ||
      ""
    ).toString();
    return base
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }, []);

  // ⬇️ טעינת לוח הריטריטים
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = await fetchRetreatsCalendar(24);
        if (mounted) setRetreatDates(map || {});
        // דוגמה: { "2025-10-15": { type:"yoga", name:"...", slug:"yoga-oct-15" } }
      } catch (err) {
        console.error("Failed to load retreats calendar:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchRetreatsCalendar]);

  // 🎨 יום מותאם: צובע ומנווט במקום לבחור
  const CustomDay = (props) => {
    const { day, className, ...rest } = props;
    if (!day || !dayjs.isDayjs(day)) {
      return <PickersDay {...rest} day={day} className={className} />;
    }

    const key = day.format("YYYY-MM-DD");
    const info = retreatDates[key];
    const type = info?.type?.toLowerCase();

    const colors = {
      yoga: "rgba(76,175,80,0.15)",
      detox: "rgba(33,150,243,0.15)",
      meditation: "rgba(156,39,176,0.15)",
      workshop: "rgba(255,152,0,0.18)",
    };
    const bg = type ? colors[type] : "transparent";
    const hoverBg = type ? bg.replace("0.15", "0.25") : "inherit";

    const goToRetreat = () => {
      const slug = makeSlug(info, key);
      navigate(`/resort/retreats/${slug}`, { state: info });
    };

    // קליק: לנווט במקום לבחור
    const handleClick = (e) => {
      if (info) {
        e.preventDefault();
        e.stopPropagation();
        goToRetreat();
        return;
      }
      rest.onClick?.(e);
    };

    // מקלדת: Enter/Space לנווט במקום לבחור
    const handleKeyDown = (e) => {
      if (info && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        e.stopPropagation();
        goToRetreat();
      } else {
        rest.onKeyDown?.(e);
      }
    };

    return (
      <PickersDay
        {...rest}
        day={day}
        className={className}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={info ? "link" : undefined}
        title={info ? info.name || info.type : undefined}
        aria-label={info ? `Retreat: ${info.name || info.type}` : undefined}
        sx={{
          backgroundColor: bg,
          borderRadius: "50%",
          cursor: info ? "pointer" : "default",
          textDecoration: "none",
          "&:hover": { backgroundColor: hoverBg },
          "&.Mui-selected": {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
          },
        }}
      />
    );
  };

  // 👥 אורחים/חדרים (מינימום 1)
  const handleSetGuests = useCallback(
    (value) => setGuests(Math.max(1, value)),
    [setGuests]
  );
  const handleSetRooms = useCallback(
    (value) => setRooms(Math.max(1, value)),
    [setRooms]
  );

  // 🔍 חיפוש זמינות
  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    await fetchAvailability();
  };

  // 🧯 ולידציה לכפתור
  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    dayjs(checkOut).isSameOrBefore(dayjs(checkIn), "day");

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
          onChange={(newValue) => {
            const key = newValue ? dayjs(newValue).format("YYYY-MM-DD") : "";
            const info = key && retreatDates[key];
            if (info) {
              const slug = makeSlug(info, key);
              navigate(`/resort/retreats/${slug}`, { state: info });
              return; // לא משנים state
            }
            setCheckIn(newValue ? dayjs(newValue).format("YYYY-MM-DD") : "");
          }}
          minDate={minCheckIn}
          maxDate={farFuture}
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
          onChange={(newValue) => {
            const key = newValue ? dayjs(newValue).format("YYYY-MM-DD") : "";
            const info = key && retreatDates[key];
            if (info) {
              const slug = makeSlug(info, key);
              navigate(`/resort/retreats/${slug}`, { state: info });
              return; // לא משנים state
            }
            setCheckOut(newValue ? dayjs(newValue).format("YYYY-MM-DD") : "");
          }}
          minDate={minCheckOut} // 👈 חשוב: יום אחרי check-in
          maxDate={farFuture}
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
