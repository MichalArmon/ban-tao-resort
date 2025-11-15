import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { GLOBAL_API_BASE } from "../config/api";
import { useDateSelection } from "./DateSelectionContext";

const BookingContext = createContext();
export const useBooking = () => useContext(BookingContext);

const BOOKINGS_BASE_URL = `${GLOBAL_API_BASE}/bookings`;
const RETREATS_API_URL = `${GLOBAL_API_BASE}/retreats`;

export const BookingProvider = ({ children }) => {
  // 🆕 צריכת נתונים מהקונטקסט המרכזי
  const { checkIn, checkOut, guests } = useDateSelection();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔗 בחירה להזמנה (Room / Session / Retreat)
  const [selection, setSelection] = useState(null);
  const clearSelection = useCallback(() => setSelection(null), []);

  // 🎨 Retreat Dates
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

  // 🧾 CREATE BOOKING
  const createBooking = useCallback(async (payload) => {
    // 💡 הערה: כאן ניתן להשתמש ב-checkIn, checkOut, guests אם הם לא נכללים ב-payload
    // לדוגמה: const finalPayload = { ...payload, checkIn, checkOut, guests };

    const res = await fetch(`${BOOKINGS_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    setBookings((prev) => [...prev, data]);
    return data;
  }, []);

  // 📋 FETCH ALL BOOKINGS
  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${BOOKINGS_BASE_URL}/all`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : data.bookings || []);
    setLoading(false);
  }, []);

  // 👤 FETCH USER BOOKINGS
  const fetchUserBookings = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    const res = await fetch(`${BOOKINGS_BASE_URL}/user?email=${email}`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : data.bookings || []);
    setLoading(false);
  }, []);

  // 🧾 UPDATE STATUS
  const updateBookingStatus = useCallback(async (id, status) => {
    const res = await fetch(`${BOOKINGS_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);

    setBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, status } : b))
    );
    return data;
  }, []);

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
