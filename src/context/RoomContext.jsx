import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";

const RoomsContext = createContext(null);

export const RoomsProvider = ({ children }) => {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  /* ============================================================
     ⚡ טוען את כל סוגי החדרים (פעם אחת)
     ============================================================ */
  const ensureTypes = useCallback(async () => {
    if (types.length > 0) return; // כבר נטען
    await refreshRooms();
  }, [types]);

  /* ============================================================
     🔁 רענון ידני של רשימת החדרים
     ============================================================ */
  const refreshRooms = useCallback(async () => {
    setLoadingTypes(true);
    setTypesError(null);
    try {
      // ✅ הנתיב הזה תואם בדיוק ל־routes שלנו
      const list = await get("/rooms/types");
      setTypes(list || []);
    } catch (err) {
      console.error("❌ Failed to load room types:", err);
      setTypesError(err);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  /* ============================================================
     🔍 שליפת חדר לפי ID (לעריכת אדמין)
     ============================================================ */
  const getRoomById = useCallback(async (id) => {
    if (!id) return null;
    try {
      // ✅ שימי לב: הנתיב כולל types/:id (לא id פעמיים!)
      const room = await get(`/rooms/types/${id}`);
      setSelectedRoom(room);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by ID:", err);
      throw err;
    }
  }, []);

  const value = {
    types,
    loadingTypes,
    typesError,
    ensureTypes,
    refreshRooms,
    selectedRoom,
    setSelectedRoom,
    getRoomById, // ✅ חשוב להחזיר לקונטקסט
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);
