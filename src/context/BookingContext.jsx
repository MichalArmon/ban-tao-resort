// src/context/BookingContext.jsx (קוד מלא ומתוקן)

import React, { createContext, useContext, useState, useCallback } from "react";

const BookingContext = createContext();
// 🔑 הכתובת הבסיסית הכללית, עבור פיתוח מקומי (עדיין HTTP)
const GLOBAL_API_BASE = "http://localhost:3000/api/v1";
const API_BASE_URL = `${GLOBAL_API_BASE}/bookings`;

const formatDate = (date) => {
  // פורמט YYYY-MM-DD (הנדרש ע"י שדות input type="date" ו-API)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => {
  return formatDate(new Date());
};

const getTomorrowDate = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  // 🔑 הוספת יום אחד לתאריך הנוכחי
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

// Custom hook to use the booking context
export const useBooking = () => {
  return useContext(BookingContext);
};

// ----------------------------------------------------
// --- Booking Provider ---
// ----------------------------------------------------
export const BookingProvider = ({ children }) => {
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1); // --- Core Fetch Function: Check Availability ---

  const fetchAvailability = useCallback(async () => {
    // ... (קוד fetchAvailability קיים) ...
    if (!checkIn || !checkOut || guests < 1 || rooms < 1) {
      setError("Please select valid dates, guests, and rooms.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");
    setAvailableRooms([]);

    try {
      const url = `${API_BASE_URL}/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch availability.");
      }

      setAvailableRooms(data.availableRooms);
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
  }, [checkIn, checkOut, guests, rooms]); // Dependency on dates ensures the function uses current state // --- Core Fetch Function: Get Quote ---

  const fetchQuote = async (roomType, currentCheckIn, currentCheckOut) => {
    // ... (קוד fetchQuote קיים) ...
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
      return data; // Returns {totalPrice, isRetreatPrice}
    } catch (error) {
      console.error("Quote fetch failed:", error);
      throw error;
    }
  };

  // ----------------------------------------------------------------------
  // 🔑 פונקציה חדשה: שליפת מפת ריטריטים לצורך צביעת לוח שנה
  // ----------------------------------------------------------------------
  const fetchMonthlyRetreatsMap = useCallback(async (year, month) => {
    try {
      // 🔑 משתמש בנתיב הכללי של ה-API, ופונה ל-Endpoint של הריטריטים
      const url = `${GLOBAL_API_BASE}/retreats/monthly-map?year=${year}&month=${month}`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        throw new Error("Failed to fetch retreat calendar data.");
      }
      const data = await response.json();
      return data?.days || {};
      // מחזיר מפת תאריכים
    } catch (error) {
      console.error("Retreats map fetch failed:", error);
      // במקרה של כשל, נחזיר אובייקט ריק כדי לא לשבור את ה-UI
      return {};
    }
  }, []); // הפונקציה תלויה רק בפרמטרים שמגיעים מה-DatePicker // --- Context Value ---

  const fetchRetreatsCalendar = useCallback(async (months = 24) => {
    try {
      const url = `${GLOBAL_API_BASE}/retreats/calendar?months=${months}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed retreats calendar: ${res.status}`);
      const data = await res.json();
      return data?.days || {}; // מפה { "YYYY-MM-DD": {...} }
    } catch (e) {
      console.error("fetchRetreatsCalendar failed:", e);
      return {};
    }
  }, []);

  const value = {
    fetchRetreatsCalendar,
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
    setRooms, // Functions
    fetchAvailability,
    fetchQuote,
    fetchMonthlyRetreatsMap, // 🔑 הוספה קריטית לאובייקט ה-value
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
