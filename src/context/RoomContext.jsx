import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { get } from "../config/api";
import { useDateSelection } from "./DateSelectionContext";

const RoomsContext = createContext(null);

export const RoomsProvider = ({ children }) => {
  // 🆕 צריכת הסטייט והסטאטרים מהקונטקסט המרכזי
  const {
    checkIn,
    checkOut,
    guests,
    roomsCount,
    setGuests,
    setRoomsCount,
    setCheckIn,
    setCheckOut,
  } = useDateSelection();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);

  /* ============================================================
    🟢 זמינות חדרים
    ============================================================ */
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  /* ============================================================
    🔁 רענון רשימת חדרים (Refresh)
    ============================================================ */
  const refreshRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const list = await get("/rooms");
      setRooms(list || []);
    } catch (err) {
      console.error("❌ Failed to load rooms:", err);
      setRoomsError(err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  /* ============================================================
    ⚡ טוען את כל החדרים (פעם אחת)
    ============================================================ */
  const ensureRooms = useCallback(async () => {
    if (rooms.length > 0) return;
    await refreshRooms();
  }, [rooms, refreshRooms]);

  /* ============================================================
    🔍 שליפת חדר לפי ID (Admin)
    ============================================================ */
  const getRoomById = useCallback(async (id) => {
    if (!id) return null;
    try {
      const room = await get(`/rooms/${id}`);
      setSelectedRoom(room);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by ID:", err);
      throw err;
    }
  }, []);

  /* ============================================================
    🔍 שליפת חדר לפי slug (Guests)
    ============================================================ */
  const getRoomBySlug = useCallback(async (slug) => {
    if (!slug) return null;
    try {
      const room = await get(`/rooms/slug/${slug}`);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by slug:", err);
      throw err;
    }
  }, []);

  /* ============================================================
    🧮 זמינות חדר ספציפי (Slug) - משתמש בתאריכים מהקונטקסט המרכזי
    ============================================================ */
  const getRoomAvailability = useCallback(
    async ({ roomSlug, checkIn: ci, checkOut: co }) => {
      // 🆕 שימוש בתאריכים מהסטייט המרכזי, אם לא סופקו כפרמטרים
      const effectiveCheckIn = ci || checkIn;
      const effectiveCheckOut = co || checkOut;

      if (!roomSlug || !effectiveCheckIn || !effectiveCheckOut) return null;

      try {
        setAvailabilityLoading(true);
        setAvailabilityError(null);

        // 🆕 שימוש במשתנים המעודכנים
        const url = `/rooms/availability?room=${roomSlug}&checkIn=${effectiveCheckIn}&checkOut=${effectiveCheckOut}`;
        console.log("🛏️ Checking room availability:", url);

        const res = await get(url);
        return res; // מחזיר אובייקט חדר אחד עם זמינות
      } catch (err) {
        console.error("❌ Room availability failed:", err);
        setAvailabilityError(err?.message || "Failed to check availability");
        return null;
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [checkIn, checkOut]
  );

  /* ============================================================
    🧭 זמינות לכל החדרים — ANY - משתמש בתאריכים מהקונטקסט המרכזי
    ============================================================ */
  const searchAvailableRooms = useCallback(
    async ({ checkIn: ci, checkOut: co }) => {
      // 🆕 שימוש בתאריכים מהסטייט המרכזי, אם לא סופקו כפרמטרים
      const effectiveCheckIn = ci || checkIn;
      const effectiveCheckOut = co || checkOut;

      if (!effectiveCheckIn || !effectiveCheckOut) return [];

      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        // 🆕 שימוש במשתנים המעודכנים
        const url = `/rooms/availability?checkIn=${effectiveCheckIn}&checkOut=${effectiveCheckOut}`;
        console.log("🌐 Checking ANY room availability:", url);

        const data = await get(url);

        // backend מחזיר "rooms" או "availableRooms"
        const list =
          data?.availableRooms ||
          data?.rooms ||
          (Array.isArray(data) ? data : []);

        setAvailableRooms(list);
        return list;
      } catch (err) {
        console.error("❌ Failed to search room availability:", err);
        setAvailabilityError(err?.message || "Failed to load availability.");
        setAvailableRooms([]);
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [checkIn, checkOut]
  );

  const value = {
    /* Data */
    rooms,
    loadingRooms,
    roomsError,
    selectedRoom,

    /* Fetchers */
    ensureRooms, // ➡️ מוגדר כעת למעלה
    refreshRooms, // ➡️ מוגדר כעת למעלה
    getRoomById, // ➡️ מוגדר כעת למעלה
    getRoomBySlug, // ➡️ מוגדר כעת למעלה

    /* Availability */
    availableRooms,
    availabilityLoading,
    availabilityError,
    getRoomAvailability,
    searchAvailableRooms,
    setAvailableRooms,

    // נתונים נצרכים מה-DateSelectionContext:
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    roomsCount,
    setRoomsCount,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);
