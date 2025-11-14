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
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";
import GuestRoomPopover from "./GuestRoomPopover";
import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";

// 🆕 הקומפוננטה החדשה
import ColoredRetreatDay from "./ColoredRetreatDay";

moment.tz.setDefault("Asia/Bangkok");

/* ---------- Helpers ---------- */
function getDayInfo(map, iso) {
  if (!map) return null;
  const arr = map[iso];
  return Array.isArray(arr) ? arr[0] : null;
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const TYPE_COLORS = {
  yoga: "#a2868e",
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
    retreatDates,
  } = useBooking();

  const { rooms: roomList, ensureRooms, loadingRooms, roomsError } = useRooms();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);

  const minCheckIn = useMemo(() => moment().startOf("day"), []);
  const farFuture = useMemo(() => moment().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? moment(checkIn).add(1, "day") : moment().add(1, "day")),
    [checkIn]
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

  // 🏨 טוען רשימת חדרים
  useEffect(() => {
    ensureRooms().catch(() => {});
  }, [ensureRooms]);

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
    const roomSlug = selectedType?.slug ?? null;
    try {
      const result = await fetchAvailability(roomSlug);
      console.log("🏨 Search result:", result);
    } catch (err) {
      console.error("❌ handleSearch failed:", err);
    }
  };

  const typeOptions = useMemo(() => {
    const list = Array.isArray(roomList) ? roomList : [];
    return list.map((r) => ({
      slug: r.slug,
      label: r.label || r.title || r.slug,
      raw: r,
    }));
  }, [roomList]);

  const isSearchDisabled =
    !checkIn || !checkOut || moment(checkOut).isSameOrBefore(checkIn, "day");

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
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
          loading={loadingRooms}
          value={selectedType}
          onChange={(_, val) => setSelectedType(val)}
          getOptionLabel={(opt) => (opt?.label ? String(opt.label) : "")}
          isOptionEqualToValue={(o, v) => o.slug === v?.slug}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Room Type"
              placeholder={roomsError ? "Failed to load" : "Any"}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />

        <DatePicker
          label="Check-In"
          value={checkIn || null}
          onChange={(newValue) => {
            if (!moment.isMoment(newValue)) return;
            const iso = newValue.format("YYYY-MM-DD");
            const info = getDayInfo(retreatDates, iso);
            if (info) {
              const slug = info?.slug || makeSlug(info, iso);
              navigate(`/retreats/${slug}`, { state: { ...info, date: iso } });
              return;
            }
            setCheckIn(newValue);
          }}
          minDate={minCheckIn}
          maxDate={farFuture}
          slotProps={{ textField: { InputLabelProps: { shrink: true } } }}
          slots={{
            day: (props) => (
              <ColoredRetreatDay
                {...props}
                retreatDates={retreatDates}
                onSelect={(info, iso) =>
                  navigate(`/retreats/${info.slug}`, {
                    state: { ...info, date: iso },
                  })
                }
              />
            ),
          }}
          sx={{ flexGrow: 1, minWidth: { xs: "100%", md: 200 } }}
        />

        <DatePicker
          label="Check-Out"
          value={checkOut || null}
          onChange={(newValue) => {
            if (!moment.isMoment(newValue)) return;
            const iso = newValue.format("YYYY-MM-DD");
            const info = getDayInfo(retreatDates, iso);
            if (info) {
              const slug = info?.slug || makeSlug(info, iso);
              navigate(`/retreats/${slug}`, { state: { ...info, date: iso } });
              return;
            }
            setCheckOut(newValue);
          }}
          minDate={minCheckOut}
          maxDate={farFuture}
          slotProps={{ textField: { InputLabelProps: { shrink: true } } }}
          slots={{
            day: (props) => (
              <ColoredRetreatDay
                {...props}
                retreatDates={retreatDates}
                onSelect={(info, iso) =>
                  navigate(`/retreats/${info.slug}`, {
                    state: { ...info, date: iso },
                  })
                }
              />
            ),
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

        {/* Search Button */}
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
