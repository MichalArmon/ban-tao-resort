// src/components/AvailabilityBar.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Stack, Button, CircularProgress, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useNavigate } from "react-router-dom";
import GuestRoomPopover from "./GuestRoomPopover";

dayjs.extend(isSameOrBefore);

import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";

const AvailabilityBar = () => {
  // Booking state/actions
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    rooms,
    setRooms,
    fetchAvailability, // נקרא עם roomType (slug/_id) או null
    loading,
    fetchRetreatsCalendar,
  } = useBooking();

  // Rooms state/actions
  const { types, ensureTypes, loadingTypes, typesError } = useRooms();

  const navigate = useNavigate();

  // 📅 Retreats calendar
  const [retreatDates, setRetreatDates] = useState({});

  // 🏷️ Room Type שנבחר (ברירת מחדל: Any)
  const [selectedType, setSelectedType] = useState(null);

  // 🗓️ Date constraints
  const minCheckIn = useMemo(() => dayjs().startOf("day"), []);
  const farFuture = useMemo(() => dayjs().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? dayjs(checkIn).add(1, "day") : minCheckIn.add(1, "day")),
    [checkIn, minCheckIn]
  );

  // ✨ slug for retreat/day navigation
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

  // ⬇️ טוען ריטריטים
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = await fetchRetreatsCalendar(24);
        if (mounted) setRetreatDates(map || {});
      } catch (err) {
        console.error("Failed to load retreats calendar:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchRetreatsCalendar]);

  // ⬇️ טוען סוגי חדרים (החדשים) עבור הבורר
  useEffect(() => {
    (async () => {
      try {
        await ensureTypes();
      } catch (e) {
        console.error("Failed to ensure room types:", e);
      }
    })();
  }, [ensureTypes]);

  // 🎨 יום מותאם: צובע ומנווט לריטריט במקום לבחור תאריך
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

    const handleClick = (e) => {
      if (info) {
        e.preventDefault();
        e.stopPropagation();
        goToRetreat();
        return;
      }
      rest.onClick?.(e);
    };

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

  // 👥 Guests/Rooms (מינימום 1)
  const handleSetGuests = useCallback(
    (value) => setGuests(Math.max(1, value)),
    [setGuests]
  );
  const handleSetRooms = useCallback(
    (value) => setRooms(Math.max(1, value)),
    [setRooms]
  );

  // 🔍 Search availability — שולח תמיד slug אם קיים, או null (Any)
  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    const roomTypeSlug = selectedType?.slug ?? null;
    await fetchAvailability(roomTypeSlug);
  };

  // 👉 אופציה (לא חובה): להריץ חיפוש אוטומטי כשמחליפים סוג, אם תאריכים מלאים
  // useEffect(() => {
  //   if (checkIn && checkOut) {
  //     fetchAvailability(selectedType?.slug ?? null);
  //   }
  // }, [selectedType, checkIn, checkOut, fetchAvailability]);

  // 🧯 ולידציה לכפתור
  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    dayjs(checkOut).isSameOrBefore(dayjs(checkIn), "day");

  // 🧮 אופציות ל־Autocomplete מה־types
  const typeOptions = useMemo(() => {
    const list = Array.isArray(types) ? types : [];
    return list.map((t) => ({
      slug: t.slug,
      label: t.label || t.title || t.slug,
      raw: t,
    }));
  }, [types]);

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
        {/* Room Type */}
        <Autocomplete
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 220 } }}
          options={typeOptions}
          loading={loadingTypes}
          value={selectedType}
          onChange={(_, val) => setSelectedType(val)}
          getOptionLabel={(opt) => (opt?.label ? String(opt.label) : "")}
          isOptionEqualToValue={(o, v) => o.slug === v?.slug}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Room Type"
              placeholder={typesError ? "Failed to load" : "Any"}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />

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
              return;
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
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 200 } }}
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
              return;
            }
            setCheckOut(newValue ? dayjs(newValue).format("YYYY-MM-DD") : "");
          }}
          minDate={minCheckOut}
          maxDate={farFuture}
          slots={{ day: CustomDay }}
          slotProps={{
            textField: { size: "medium", InputLabelProps: { shrink: true } },
            popper: { disablePortal: true, sx: { zIndex: 2000 } },
          }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 200 } }}
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
