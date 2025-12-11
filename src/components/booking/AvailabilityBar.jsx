import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Stack, Button, CircularProgress, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import { useNavigate } from "react-router-dom";

import GuestRoomPopover from "./GuestRoomPopover";
import ColoredRetreatDay from "./ColoredRetreatDay";

import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";
import { useDateSelection } from "../../context/DateSelectionContext";

moment.tz.setDefault("Asia/Bangkok");

const AvailabilityBar = () => {
  const { retreatDates } = useBooking();

  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    roomsCount: rooms,
    setRoomsCount: setRooms,
  } = useDateSelection();

  const {
    rooms: roomList,
    ensureRooms,
    loadingRooms,
    checkRoomAvailability,
    availabilityLoading,
    setAvailableRooms,
    availableRooms,
  } = useRooms();

  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);
  const hasAutoSearched = useRef(false);

  /** --------------------------------------
   *  Room Type Options
   ----------------------------------------*/
  const typeOptions = useMemo(() => {
    const list = Array.isArray(roomList) ? roomList : [];
    const mapped = list.map((r) => ({
      slug: r.slug,
      label: r.label || r.title || r.slug,
      raw: r,
    }));
    return [{ slug: "any", label: "Any", raw: null }, ...mapped];
  }, [roomList]);

  /** --------------------------------------
   *  טווחי תאריכים
   ----------------------------------------*/
  const minCheckIn = useMemo(() => moment().startOf("day"), []);
  const farFuture = useMemo(() => moment().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? moment(checkIn).add(1, "day") : moment().add(1, "day")),
    [checkIn]
  );

  /** --------------------------------------
   *  useEffect #1 — ברירות מחדל:
   *  ✔ היום → מחר
   *  ✔ Room Type = Any
   ----------------------------------------*/
  useEffect(() => {
    // תאריכים כברירת מחדל
    if (!checkIn || !checkOut) {
      const today = moment().startOf("day");
      const tomorrow = moment().add(1, "day").startOf("day");
      setCheckIn(today);
      setCheckOut(tomorrow);
    }

    // בחירת ANY כברירת מחדל
    if (!selectedType && typeOptions.length > 0) {
      const anyOption = typeOptions.find((o) => o.slug === "any");
      if (anyOption) setSelectedType(anyOption);
    }
  }, [checkIn, checkOut, selectedType, typeOptions, setCheckIn, setCheckOut]);

  /** --------------------------------------
   *  טעינת רשימת חדרים
   ----------------------------------------*/
  useEffect(() => {
    ensureRooms().catch(() => {});
  }, [ensureRooms]);

  /** --------------------------------------
   *  פונקציות עזר
   ----------------------------------------*/
  const handleSetGuests = useCallback(
    (v) => setGuests(Math.max(1, v)),
    [setGuests]
  );

  const handleSetRooms = useCallback(
    (v) => setRooms(Math.max(1, v)),
    [setRooms]
  );

  /** --------------------------------------
   *  חיפוש חדרים
   ----------------------------------------*/
  const handleSearch = async () => {
    if (!checkIn || !checkOut) return;

    const checkInISO = moment(checkIn).format("YYYY-MM-DD");
    const checkOutISO = moment(checkOut).format("YYYY-MM-DD");
    const roomSlug = selectedType?.slug ?? "any";

    try {
      if (roomSlug === "any") {
        const list = await checkRoomAvailability({
          checkIn: checkInISO,
          checkOut: checkOutISO,
        });
        setAvailableRooms(list);
      } else {
        const result = await checkRoomAvailability({
          roomSlug,
          checkIn: checkInISO,
          checkOut: checkOutISO,
        });
        setAvailableRooms(result ? [result] : []);
      }
    } catch (err) {
      console.error("❌ handleSearch failed:", err);
    }
  };

  /** --------------------------------------
   *  useEffect #2 — חיפוש אוטומטי פעם אחת
   ----------------------------------------*/
  useEffect(() => {
    if (hasAutoSearched.current) return;

    if (
      checkIn &&
      checkOut &&
      selectedType?.slug &&
      Array.isArray(roomList) &&
      roomList.length > 0
    ) {
      hasAutoSearched.current = true;
      handleSearch();
    }
  }, [checkIn, checkOut, selectedType, roomList]);

  /** --------------------------------------
   *  מצב כפתור
   ----------------------------------------*/
  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    moment(checkOut).isSameOrBefore(checkIn, "day") ||
    availabilityLoading;

  /** --------------------------------------
   *  JSX
   ----------------------------------------*/
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
              InputLabelProps={{ shrink: true }}
            />
          )}
        />

        {/* Date Pickers */}
        <DatePicker
          label="Check-In"
          value={checkIn || null}
          onChange={(v) => setCheckIn(v)}
          minDate={minCheckIn}
          maxDate={farFuture}
          slotProps={{ textField: { InputLabelProps: { shrink: true } } }}
          slots={{
            day: (props) => (
              <ColoredRetreatDay {...props} retreatDates={retreatDates} />
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <DatePicker
          label="Check-Out"
          value={checkOut || null}
          onChange={(v) => setCheckOut(v)}
          minDate={minCheckOut}
          maxDate={farFuture}
          slotProps={{ textField: { InputLabelProps: { shrink: true } } }}
          slots={{
            day: (props) => (
              <ColoredRetreatDay {...props} retreatDates={retreatDates} />
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        {/* Guests & Rooms */}
        <GuestRoomPopover
          guests={guests}
          rooms={rooms}
          setGuests={handleSetGuests}
          setRooms={handleSetRooms}
          sx={{ flexGrow: 1 }}
        />

        {/* Search Button */}
        <Button
          variant="contained"
          size="large"
          disabled={isSearchDisabled}
          onClick={handleSearch}
          sx={{ width: 140, height: 56 }}
        >
          {availabilityLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Search"
          )}
        </Button>
      </Stack>
    </LocalizationProvider>
  );
};

export default AvailabilityBar;
