import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import { GLOBAL_API_BASE } from "../config/api";
import { useUser } from "./UserContext";

const BookingContext = createContext();
export const useBooking = () => useContext(BookingContext);

const BOOKINGS_BASE_URL = `${GLOBAL_API_BASE}/bookings`;
const RETREATS_API_URL = `${GLOBAL_API_BASE}/retreats`;

export const BookingProvider = ({ children }) => {
  const { token } = useUser(); // 🟢 חשוב!

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ------------------------------------------------------
  // 🔗 SELECTION
  // ------------------------------------------------------
  const [selection, setSelection] = useState(null);
  const clearSelection = useCallback(() => setSelection(null), []);

  // ------------------------------------------------------
  // 🎨 RETREAT DATES
  // ------------------------------------------------------
  const [retreatDates, setRetreatDates] = useState({});

  const fetchRetreatsYear = useCallback(async () => {
    try {
      const res = await fetch(
        `${RETREATS_API_URL}/calendar?from=2025-01-01&to=2026-12-31`
      );
      const data = await res.json();

      const flat = {};
      for (const { date, items } of data.days || []) flat[date] = items;

      return flat;
    } catch (err) {
      return {};
    }
  }, []);

  useEffect(() => {
    (async () => {
      const map = await fetchRetreatsYear();
      setRetreatDates(map);
    })();
  }, [fetchRetreatsYear]);

  // ------------------------------------------------------
  // 🧾 CREATE BOOKING
  // ------------------------------------------------------
  const createBooking = useCallback(
    async (payload) => {
      const res = await fetch(`${BOOKINGS_BASE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // 🟢 במידה ודורש התחברות
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      setBookings((prev) => [...prev, data]);
      return data;
    },
    [token]
  );

  // ------------------------------------------------------
  // 📋 FETCH ALL BOOKINGS — ADMIN
  // ------------------------------------------------------
  const fetchAllBookings = useCallback(async () => {
    if (!token) return; // בלי טוקן אין גישה לאדמין

    setLoading(true);
    try {
      const res = await fetch(`${BOOKINGS_BASE_URL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`, // 🟢 חובה
        },
      });

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ------------------------------------------------------
  // 👤 FETCH USER BOOKINGS
  // ------------------------------------------------------
  const fetchUserBookings = useCallback(
    async (email) => {
      if (!email || !token) return;

      setLoading(true);
      try {
        const res = await fetch(`${BOOKINGS_BASE_URL}/user?email=${email}`, {
          headers: {
            Authorization: `Bearer ${token}`, // 🟢 חובה למשתמש מחובר
          },
        });

        const data = await res.json();
        setBookings(Array.isArray(data) ? data : data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // ------------------------------------------------------
  // 🧾 UPDATE STATUS
  // ------------------------------------------------------
  const updateBookingStatus = useCallback(
    async (id, status) => {
      const res = await fetch(`${BOOKINGS_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🟢 חובה
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );

      return data;
    },
    [token]
  );

  // ------------------------------------------------------
  // 🟢 VALUES
  // ------------------------------------------------------
  const value = {
    bookings,
    loading,
    error,

    // BOOKINGS:
    createBooking,
    fetchUserBookings,
    fetchAllBookings,
    updateBookingStatus,

    // RETREATS:
    retreatDates,
    fetchRetreatsYear,

    // SELECTION:
    selection,
    setSelection,
    clearSelection,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
