// src/context/BookingContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { GLOBAL_API_BASE } from "../config/api";

const BookingContext = createContext();

// בסיס ה־API הכללי (מוזן מהקובץ שלך)
const API_BASE_URL = `${GLOBAL_API_BASE}/bookings`;

/* עזר: פורמט YYYY-MM-DD */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => formatDate(new Date());
const getTomorrowDate = () => {
  const t = new Date();
  const n = new Date(t);
  n.setDate(n.getDate() + 1);
  return formatDate(n);
};

// Hook צריכה
export const useBooking = () => useContext(BookingContext);

// ----------------------------------------------------
// --- Booking Provider ---
// ----------------------------------------------------
export const BookingProvider = ({ children }) => {
  // תאריכים
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());

  // תוצאות זמינות/סטטוס
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // אורחים/חדרים
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // בחירת חדר + הצעת מחיר (משמש ב-RoomCard)
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [finalQuote, setFinalQuote] = useState(null);

  // --- Core Fetch Function: Check Availability ---
  // מקבל roomType אופציונלי (slug או _id)
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
          throw new Error(data.message || "Failed to fetch availability.");
        }

        setAvailableRooms(
          Array.isArray(data.availableRooms) ? data.availableRooms : []
        );
        setMessage(data.message || "");
      } catch (err) {
        console.error("Availability check failed:", err);
        setError(
          err.message || "An unexpected error occurred. Please try again."
        );
        setAvailableRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut, guests, rooms]
  );

  // --- Core Fetch Function: Get Quote ---
  // roomType יכול להיות slug או _id, בהתאם לתמיכה בשרת
  const fetchQuote = async (roomType, currentCheckIn, currentCheckOut) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: currentCheckIn,
          checkOut: currentCheckOut,
          roomType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get quote.");
      }
      // מחזיר { totalPrice, isRetreatPrice, currency? }
      return data;
    } catch (error) {
      console.error("Quote fetch failed:", error);
      throw error;
    }
  };

  // ----------------------------------------------------------------------
  // ריטריטים: צביעת לוח שנה
  // ----------------------------------------------------------------------
  const fetchMonthlyRetreatsMap = useCallback(async (year, month) => {
    try {
      const url = `${GLOBAL_API_BASE}/retreats/monthly-map?year=${year}&month=${month}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Failed to fetch retreat calendar data.");
      const data = await response.json();
      return data?.days || {};
    } catch (error) {
      console.error("Retreats map fetch failed:", error);
      return {};
    }
  }, []);

  const fetchRetreatsCalendar = useCallback(async (months = 24) => {
    try {
      const url = `${GLOBAL_API_BASE}/retreats/calendar?months=${months}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed retreats calendar: ${res.status}`);
      const data = await res.json();
      return data?.days || {};
    } catch (e) {
      console.error("fetchRetreatsCalendar failed:", e);
      return {};
    }
  }, []);

  const value = {
    // לוח שנה של ריטריטים
    fetchRetreatsCalendar,
    fetchMonthlyRetreatsMap,

    // State
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    availableRooms,
    loading,
    error,
    message,
    guests,
    setGuests,
    rooms,
    setRooms,

    // בחירת חדר/הצעת מחיר (ל-RoomCard)
    selectedRoomId,
    setSelectedRoomId,
    finalQuote,
    setFinalQuote,

    // Functions
    fetchAvailability, // מקבל roomType אופציונלי
    fetchQuote,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
