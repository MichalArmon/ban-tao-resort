// src/context/RoomContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";

const RoomsContext = createContext(null);

export const RoomsProvider = ({ children }) => {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState(null);

  // ⚡ טוען סוגי חדרים מהשרת פעם אחת בלבד (נשמר בזיכרון)
  const ensureTypes = useCallback(async () => {
    if (types.length > 0) return; // כבר נטען בעבר
    setLoadingTypes(true);
    setTypesError(null);
    try {
      const list = await get("/rooms/types"); // ← GET /api/v1/rooms/types
      setTypes(list || []);
    } catch (err) {
      console.error("Failed to load room types:", err);
      setTypesError(err);
    } finally {
      setLoadingTypes(false);
    }
  }, [types]);

  const value = {
    types,
    loadingTypes,
    typesError,
    ensureTypes,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};

// ✅ hook לייבוא נוח בקומפוננטות אחרות
export const useRooms = () => useContext(RoomsContext);
