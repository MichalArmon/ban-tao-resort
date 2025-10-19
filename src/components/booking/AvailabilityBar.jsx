// src/components/AvailabilityBar.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Stack,
  Button,
  CircularProgress,
  TextField,
  Tooltip,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useNavigate } from "react-router-dom";
import GuestRoomPopover from "./GuestRoomPopover";
import { alpha } from "@mui/material/styles"; // ✅ משתמשים ב-MUI alpha

dayjs.extend(isSameOrBefore);

import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";

/* ---------- Helpers ---------- */

// map יכול להיות {days:{...}} או מפה שטוחה
function getDayInfo(map, iso) {
  if (!map) return null;
  const raw = map.days?.[iso] ?? map[iso];
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] : raw;
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// צבעי ברירת מחדל לפי סוג (HEX נקיים)
const TYPE_COLORS = {
  yoga: "#a2868eff",
  detox: "#2196f3",
  meditation: "#9c27b0",
  workshop: "#ff9800",
  skiing: "#03a9f4",
  cooking: "#ffc107",
  other: "#5f5f5f",
};

const AvailabilityBar = () => {
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

  const { types, ensureTypes, loadingTypes, typesError } = useRooms();
  const navigate = useNavigate();

  const [retreatDates, setRetreatDates] = useState({}); // { days: { 'YYYY-MM-DD': [ ... ] } }
  const [selectedType, setSelectedType] = useState(null);

  const minCheckIn = useMemo(() => dayjs().startOf("day"), []);
  const farFuture = useMemo(() => dayjs().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? dayjs(checkIn).add(1, "day") : minCheckIn.add(1, "day")),
    [checkIn, minCheckIn]
  );

  const makeSlug = useCallback((info, key) => {
    const base = (
      info?.slug ||
      info?.name ||
      info?.type ||
      key ||
      ""
    ).toString();
    return slugify(base);
  }, []);

  // טוען מפה מאוחדת (למשל 24 חודשים קדימה)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const map = await fetchRetreatsCalendar(24);
      if (mounted) setRetreatDates(map || {});
    })();
    return () => {
      mounted = false;
    };
  }, [fetchRetreatsCalendar]);

  // סוגי חדרים לבורר
  useEffect(() => {
    ensureTypes().catch(() => {});
  }, [ensureTypes]);

  // יום מותאם: עיגול גדול מלא (כמו “החום”), Tooltip של שם הריטריט, וניווט לפי slug
  const ColoredDay = (props) => {
    const { day, className, ...rest } = props;
    if (!day || !dayjs.isDayjs(day)) {
      return <PickersDay {...rest} day={day} className={className} />;
    }

    const iso = day.format("YYYY-MM-DD");
    const info = getDayInfo(retreatDates, iso);
    if (!info) {
      return <PickersDay {...rest} day={day} className={className} />;
    }

    // ✅ color מהשרת אם קיים, אחרת לפי סוג; את האטימות עושים עם alpha
    const base =
      info?.color || TYPE_COLORS[(info?.type || "").toLowerCase()] || "#5f5f5f";

    const fill = alpha(base, 0.55);
    const hoverFill = alpha(base, 0.7);

    const slug = info?.slug || makeSlug(info, iso);

    const goToRetreat = () => {
      // אם ה-Router שלך עם basename="/resort", אל תוסיפי אותו כאן
      navigate(`/retreats/${slug}`, { state: { ...info, date: iso } });
    };

    const node = (
      <PickersDay
        {...rest}
        day={day}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          goToRetreat();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            goToRetreat();
          } else if (rest.onKeyDown) {
            rest.onKeyDown(e);
          }
        }}
        role="link"
        aria-label={`Retreat: ${info.name || info.type}`}
        sx={{
          position: "relative",
          // עיגול גדול – כמעט בגודל מלא של התא (בדיוק כמו ה"עיגול החום")
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 2, // 👈 זה הגודל שביקשת
            borderRadius: "50%",
            backgroundColor: fill, // מילוי מלא, בלי בורדר
            pointerEvents: "none",
            transition: "background-color 120ms ease",
          },
          cursor: "pointer",
          "&:hover::before": { backgroundColor: hoverFill },
          "&.Mui-selected": {
            backgroundColor: "primary.main !important",
            color: "primary.contrastText !important",
          },
        }}
      />
    );

    // Tooltip עם שם הריטריט מעל היום
    return (
      <Tooltip
        title={info?.name || info?.type || "Retreat"}
        arrow
        placement="top"
      >
        <span>{node}</span>
      </Tooltip>
    );
  };

  const handleSetGuests = useCallback(
    (v) => setGuests(Math.max(1, v)),
    [setGuests]
  );
  const handleSetRooms = useCallback(
    (v) => setRooms(Math.max(1, v)),
    [setRooms]
  );

  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;
    const roomTypeSlug = selectedType?.slug ?? null;
    await fetchAvailability(roomTypeSlug);
  };

  const typeOptions = useMemo(() => {
    const list = Array.isArray(types) ? types : [];
    return list.map((t) => ({
      slug: t.slug,
      label: t.label || t.title || t.slug,
      raw: t,
    }));
  }, [types]);

  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    dayjs(checkOut).isSameOrBefore(dayjs(checkIn), "day");

  // תואם גם v5 (renderDay) וגם v6 (slots.day)
  const renderColoredDay = useCallback(
    (date, _valueOrProps, pickersDayProps) => (
      <ColoredDay {...(pickersDayProps || _valueOrProps)} day={date} />
    ),
    []
  );

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
            const iso = newValue ? dayjs(newValue).format("YYYY-MM-DD") : "";
            const info = iso && getDayInfo(retreatDates, iso);
            if (info) {
              const slug = info?.slug || makeSlug(info, iso);
              navigate(`/retreats/${slug}`, { state: { ...info, date: iso } });
              return;
            }
            setCheckIn(newValue ? iso : "");
          }}
          minDate={minCheckIn}
          maxDate={farFuture}
          // v5
          renderDay={(date, value, props) =>
            renderColoredDay(date, value, props)
          }
          // v6
          slots={{ day: (props) => <ColoredDay {...props} /> }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 200 } }}
        />

        {/* Check-Out */}
        <DatePicker
          label="Check-Out"
          value={checkOut ? dayjs(checkOut) : null}
          onChange={(newValue) => {
            const iso = newValue ? dayjs(newValue).format("YYYY-MM-DD") : "";
            const info = iso && getDayInfo(retreatDates, iso);
            if (info) {
              const slug = info?.slug || makeSlug(info, iso);
              navigate(`/retreats/${slug}`, { state: { ...info, date: iso } });
              return;
            }
            setCheckOut(newValue ? iso : "");
          }}
          minDate={minCheckOut}
          maxDate={farFuture}
          // v5
          renderDay={(date, value, props) =>
            renderColoredDay(date, value, props)
          }
          // v6
          slots={{ day: (props) => <ColoredDay {...props} /> }}
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
