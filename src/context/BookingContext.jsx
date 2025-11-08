// 📁 src/context/BookingContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { GLOBAL_API_BASE } from "../config/api";

const BookingContext = createContext();
export const useBooking = () => useContext(BookingContext);

const API_BASE_URL = `${GLOBAL_API_BASE}/bookings`;

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🆕 בחירה נוכחית (האובייקט שBookButton שומר)
  const [selection, setSelection] = useState(() => {
    try {
      const raw = localStorage.getItem("banTao.selection");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // 🆕 שמירה ב-localStorage בכל שינוי
  useEffect(() => {
    try {
      if (selection)
        localStorage.setItem("banTao.selection", JSON.stringify(selection));
      else localStorage.removeItem("banTao.selection");
    } catch {}
  }, [selection]);

  // 🆕 ניקוי הבחירה (למשל אחרי הזמנה מוצלחת)
  const clearSelection = useCallback(() => setSelection(null), []);

  /* ===================================================================
   * 🆕 CREATE BOOKING — שולח הזמנה לשרת
   * =================================================================== */
  const createBooking = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to create booking.");

      console.log("✅ Booking created:", data);

      // מוסיפים להזמנות בלוקאלי
      setBookings((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("❌ createBooking failed:", err);
      throw err;
    }
  }, []);

  /* ===================================================================
   * 📋 FETCH ALL BOOKINGS — For Admin
   * =================================================================== */
  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/all`);
      const data = await res.json();
      console.log("📦 Bookings response:", data);
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
        ? data.bookings
        : [];
      setBookings(arr);
    } catch (err) {
      console.error("❌ fetchAllBookings failed:", err);
      setError(err?.message || "Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===================================================================
   * 👤 FETCH USER BOOKINGS — For logged-in guest
   * =================================================================== */
  const fetchUserBookings = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user?email=${email}`);
      const data = await res.json();
      console.log("📦 User bookings:", data);
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
        ? data.bookings
        : [];
      setBookings(arr);
    } catch (err) {
      console.error("❌ fetchUserBookings failed:", err);
      setError(err?.message || "Failed to load user bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===================================================================
   * 🧾 UPDATE BOOKING STATUS — For Admin
   * =================================================================== */
  const updateBookingStatus = useCallback(async (id, status) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to update booking.");
      // עדכון בלוקאלי כדי לא לרענן
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      return data;
    } catch (err) {
      console.error("❌ updateBookingStatus failed:", err);
      throw err;
    }
  }, []);

  /* ===================================================================
   * ✈️ EXPORT VALUE
   * =================================================================== */
  const value = useMemo(
    () => ({
      bookings,
      loading,
      error,
      fetchAllBookings,
      fetchUserBookings,
      updateBookingStatus,
      createBooking, // 🆕 הוספנו כאן את הפונקציה החדשה

      selection,
      setSelection,
      clearSelection,
    }),
    [
      bookings,
      loading,
      error,
      fetchAllBookings,
      fetchUserBookings,
      updateBookingStatus,
      createBooking,
      selection,
      setSelection,
      clearSelection,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
