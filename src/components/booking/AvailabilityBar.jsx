import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  useEffect(() => {
    if (availableRooms.length === 1 && availableRooms[0].slug) {
      const room = availableRooms[0];
      const newSelectedType = {
        slug: room.slug,
        label: room.label || room.title || room.slug,
        raw: room,
      };
      if (selectedType?.slug !== newSelectedType.slug) {
        setSelectedType(newSelectedType);
      }
    }
  }, [availableRooms, selectedType]);

  const minCheckIn = useMemo(() => moment().startOf("day"), []);
  const farFuture = useMemo(() => moment().add(3, "year").endOf("day"), []);
  const minCheckOut = useMemo(
    () => (checkIn ? moment(checkIn).add(1, "day") : moment().add(1, "day")),
    [checkIn]
  );

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

    const checkInISO = moment(checkIn).format("YYYY-MM-DD");
    const checkOutISO = moment(checkOut).format("YYYY-MM-DD");

    const roomSlug = selectedType?.slug ?? "any";

    try {
      if (roomSlug === "Any" || roomSlug === "any") {
        const list = await checkRoomAvailability({
          checkIn: checkInISO,
          checkOut: checkOutISO,
        });
        console.log("🏨 ANY availability:", list);
        setAvailableRooms(list);
      } else {
        const result = await checkRoomAvailability({
          roomSlug,
          checkIn: checkInISO,
          checkOut: checkOutISO,
        });
        console.log("🏨 Specific room availability:", result);
        setAvailableRooms(result ? [result] : []);
      }
    } catch (err) {
      console.error("❌ handleSearch failed:", err);
    }
  };

  const typeOptions = useMemo(() => {
    const list = Array.isArray(roomList) ? roomList : [];
    const mapped = list.map((r) => ({
      slug: r.slug,
      label: r.label || r.title || r.slug,
      raw: r,
    }));
    return [{ slug: "any", label: "Any", raw: null }, ...mapped];
  }, [roomList]);

  const isSearchDisabled =
    !checkIn ||
    !checkOut ||
    moment(checkOut).isSameOrBefore(checkIn, "day") ||
    availabilityLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {" "}
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
        {/* Room Type */}{" "}
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
        {/* Date Pickers */}{" "}
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
        />{" "}
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
        {/* Guests & Rooms */}{" "}
        <GuestRoomPopover
          guests={guests}
          rooms={rooms}
          setGuests={handleSetGuests}
          setRooms={handleSetRooms}
          sx={{ flexGrow: 1 }}
        />
        {/* Search Button */}{" "}
        <Button
          variant="contained"
          size="large"
          disabled={isSearchDisabled}
          onClick={handleSearch}
          sx={{ width: 140, height: 56 }}
        >
          {" "}
          {availabilityLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Search"
          )}{" "}
        </Button>{" "}
      </Stack>{" "}
    </LocalizationProvider>
  );
};

export default AvailabilityBar;
