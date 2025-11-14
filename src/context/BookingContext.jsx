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
const RETREATS_API_URL = `${GLOBAL_API_BASE}/retreats`;
const ROOMS_API_URL = `${GLOBAL_API_BASE}/rooms`;

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const [availableRooms, setAvailableRooms] = useState([]);
  const [message, setMessage] = useState(null);

  /* ============================================================
   * 🔗 בחירת משתמש / הזמנה זמנית
   * ============================================================ */
  const [selection, setSelection] = useState(() => {
    try {
      const raw = localStorage.getItem("banTao.selection");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selection)
        localStorage.setItem("banTao.selection", JSON.stringify(selection));
      else localStorage.removeItem("banTao.selection");
    } catch {}
  }, [selection]);

  const clearSelection = useCallback(() => setSelection(null), []);

  /* ============================================================
   * 🆕 RETREAT DATES (for DatePicker coloring)
   * ============================================================ */

  // מפה של כל התאריכים של ריטריטים (שנתיים קדימה)
  const [retreatDates, setRetreatDates] = useState({});

  // טוען את השנה–שנתיים של הריטריטים מראש
  const fetchRetreatsYear = useCallback(async () => {
    try {
      const res = await fetch(
        `${RETREATS_API_URL}/calendar?from=2025-01-01&to=2026-12-31`
      );
      const data = await res.json();

      // הפיכה למפה שטוחה: { "2026-01-09": [ { name, slug, color } ] }
      const flat = {};
      for (const { date, items } of data.days || []) {
        flat[date] = items;
      }

      return flat;
    } catch (err) {
      console.error("❌ fetchRetreatsYear failed:", err);
      return {};
    }
  }, []);

  // טוען את המפה פעם אחת בלבד
  useEffect(() => {
    (async () => {
      const map = await fetchRetreatsYear();
      setRetreatDates(map);
    })();
  }, [fetchRetreatsYear]);

  /* ============================================================
   * 📅 FETCH RETREATS CALENDAR (חודש יחיד – נשאר אצלך כקיים)
   * ============================================================ */

  const fetchRetreatsCalendar = useCallback(async (months = 12) => {
    try {
      const res = await fetch(`${RETREATS_API_URL}/monthly`);
      if (!res.ok) throw new Error("Failed to fetch retreats calendar.");
      const data = await res.json();
      return data.days || {};
    } catch (err) {
      console.error("❌ fetchRetreatsCalendar failed:", err);
      return {};
    }
  }, []);

  /* ============================================================
   * 🏨 FETCH ROOM AVAILABILITY
   * ============================================================ */
  const fetchAvailability = useCallback(
    async (roomTypeSlug) => {
      if (!checkIn || !checkOut) {
        console.warn("⚠️ fetchAvailability called without checkIn/checkOut", {
          checkIn,
          checkOut,
        });
        return;
      }

      setLoading(true);
      setError(null);
      setMessage(null);
      setAvailableRooms([]);

      try {
        const checkInISO = checkIn.format("YYYY-MM-DD");
        const checkOutISO = checkOut.format("YYYY-MM-DD");

        let url = `${ROOMS_API_URL}/availability?checkIn=${checkInISO}&checkOut=${checkOutISO}`;
        if (roomTypeSlug) url += `&room=${roomTypeSlug}`;

        console.log("📤 fetchAvailability → sending request:", {
          url,
          roomTypeSlug,
          checkInISO,
          checkOutISO,
        });

        const res = await fetch(url);
        const data = await res.json();

        console.log("📩 fetchAvailability → response:", {
          status: res.status,
          ok: res.ok,
          data,
        });

        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch availability.");

        if (Array.isArray(data.availableRooms)) {
          setAvailableRooms(data.availableRooms);
        } else if (Array.isArray(data.rooms)) {
          setAvailableRooms(data.rooms);
        } else if (data._id || data.room) {
          setAvailableRooms([data]);
        } else {
          setAvailableRooms([]);
        }

        setMessage(data?.message || null);
        return data;
      } catch (err) {
        console.error("❌ fetchAvailability failed:", err);
        setError(err?.message || "Failed to search availability.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut]
  );

  /* ============================================================
   * 🧾 CREATE BOOKING
   * ============================================================ */

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

      setBookings((prev) => [...prev, data]);
      return data;
    } catch (err) {
      console.error("❌ createBooking failed:", err);
      throw err;
    }
  }, []);

  /* ============================================================
   * 📋 FETCH ALL BOOKINGS (Admin)
   * ============================================================ */

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

  /* ============================================================
   * 👤 FETCH USER BOOKINGS
   * ============================================================ */

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

  /* ============================================================
   * 🧾 UPDATE BOOKING STATUS
   * ============================================================ */

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

      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );

      return data;
    } catch (err) {
      console.error("❌ updateBookingStatus failed:", err);
      throw err;
    }
  }, []);

  /* ============================================================
   * 📤 EXPORT VALUE
   * ============================================================ */

  const value = useMemo(
    () => ({
      availableRooms,
      message,
      bookings,
      loading,
      error,
      fetchAllBookings,
      fetchUserBookings,
      updateBookingStatus,
      createBooking,

      checkIn,
      setCheckIn,
      checkOut,
      setCheckOut,
      guests,
      setGuests,
      rooms,
      setRooms,
      fetchAvailability,

      // 🔥 חדשים
      retreatDates,
      setRetreatDates,
      fetchRetreatsYear,

      fetchRetreatsCalendar,

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

      checkIn,
      setCheckIn,
      checkOut,
      setCheckOut,
      guests,
      setGuests,
      rooms,
      setRooms,
      fetchAvailability,

      retreatDates,
      fetchRetreatsYear,

      fetchRetreatsCalendar,

      selection,
      setSelection,
      clearSelection,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
