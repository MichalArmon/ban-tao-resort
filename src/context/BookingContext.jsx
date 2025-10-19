// src/context/BookingContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { GLOBAL_API_BASE } from "../config/api";

const BookingContext = createContext();

// בסיס ה־API
const API_BASE_URL = `${GLOBAL_API_BASE}/bookings`;

/* ---------- Helpers ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const formatDate = (dateObj) => {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const getTodayDate = () => formatDate(new Date());
const getTomorrowDate = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDate(t);
};

// Hook לצריכה
export const useBooking = () => useContext(BookingContext);

/* =================================================================== */
/*                           Booking Provider                          */
/* =================================================================== */
export const BookingProvider = ({ children }) => {
  /* ---------- Dates ---------- */
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());

  /* ---------- Availability state ---------- */
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  /* ---------- Guests / Rooms ---------- */
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  /* ---------- Room selection + Quote ---------- */
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [finalQuote, setFinalQuote] = useState(null);

  /* =================================================================== */
  /*                         Availability (rooms)                         */
  /* =================================================================== */
  // roomType יכול להיות slug או _id (אופציונלי)
  const fetchAvailability = useCallback(
    async (roomType) => {
      if (!checkIn || !checkOut || guests < 1 || rooms < 1) {
        setError("Please select valid dates, guests, and rooms.");
        return;
      }

      setLoading(true);
      setError(null);
      setMessage("");
      setAvailableRooms([]);

      try {
        const params = new URLSearchParams({
          checkIn,
          checkOut,
          guests: String(guests),
          rooms: String(rooms),
        });
        if (roomType) params.append("roomType", roomType);

        const url = `${API_BASE_URL}/availability?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch availability.");
        }

        setAvailableRooms(
          Array.isArray(data.availableRooms) ? data.availableRooms : []
        );
        setMessage(data?.message || "");
      } catch (err) {
        console.error("Availability check failed:", err);
        setError(
          err?.message || "An unexpected error occurred. Please try again."
        );
        setAvailableRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut, guests, rooms]
  );

  /* =================================================================== */
  /*                               Quote                                 */
  /* =================================================================== */
  // מחזיר { totalPrice, isRetreatPrice, currency? }
  const fetchQuote = useCallback(
    async (roomType, currentCheckIn, currentCheckOut) => {
      const body = {
        checkIn: currentCheckIn ?? checkIn,
        checkOut: currentCheckOut ?? checkOut,
        roomType: roomType ?? null,
      };
      const res = await fetch(`${API_BASE_URL}/get-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to get quote.");
      return data;
    },
    [checkIn, checkOut]
  );

  /* =================================================================== */
  /*                        Retreats calendar (UI)                        */
  /* =================================================================== */
  // מחזיר תמיד אובייקט ימים של החודש המבוקש: { 'YYYY-MM-DD': [ {_id,name,type,color,price} ] }
  const fetchMonthlyRetreatsMap = useCallback(async (year, month) => {
    try {
      const url = `${GLOBAL_API_BASE}/retreats/monthly-map?year=${year}&month=${month}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed retreats map (${res.status})`);
      const data = await res.json();
      return data?.days || {}; // תמיד מחזיר days של אותו חודש
    } catch (e) {
      console.error("Retreats map fetch failed:", e);
      return {};
    }
  }, []);

  // מאחד כמה חודשים לפורמט אחיד אחד:
  // מחזיר תמיד: { days: { 'YYYY-MM-DD': [ {_id,name,type,color,price}, ... ] } }
  const fetchRetreatsCalendar = useCallback(
    async (monthsAhead = 24) => {
      const merged = { days: {} };
      try {
        const now = new Date();
        for (let i = 0; i < monthsAhead; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          const y = d.getFullYear();
          const m = d.getMonth() + 1; // 1..12

          const monthDays = await fetchMonthlyRetreatsMap(y, m);
          for (const [iso, items] of Object.entries(monthDays)) {
            if (!merged.days[iso]) merged.days[iso] = [];
            // אם אותו תאריך כבר קיים (מריבוי בקשות) – מאחדים
            merged.days[iso].push(...items);
          }
        }
      } catch (e) {
        console.error("fetchRetreatsCalendar failed:", e);
      }
      return merged;
    },
    [fetchMonthlyRetreatsMap]
  );

  /* =================================================================== */
  /*                                Value                                */
  /* =================================================================== */
  const value = {
    // Calendar (retreats)
    fetchRetreatsCalendar, // ← מחזיר { days: {...} }
    fetchMonthlyRetreatsMap, // ← מחזיר { ... } של חודש בודד

    // Dates
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,

    // Availability state
    availableRooms,
    loading,
    error,
    message,

    // Guests / Rooms
    guests,
    setGuests,
    rooms,
    setRooms,

    // Selection / Quote
    selectedRoomId,
    setSelectedRoomId,
    finalQuote,
    setFinalQuote,

    // Functions
    fetchAvailability,
    fetchQuote,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
