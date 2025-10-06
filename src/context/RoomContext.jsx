// src/context/RoomsContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { get } from "../config/api"; // משתמש ב- GLOBAL_API_BASE

const RoomsCtx = createContext(null);

// ----- API (אותו קובץ) -----
async function apiGetRoomTypes() {
  // החזר לדוגמה: [{label, type, slug}]
  return get("/rooms/types");
}
async function apiGetRoomByType(type) {
  // החזר לדוגמה: { type, title, hero, gallery, features, ... }
  return get(`/rooms/${encodeURIComponent(type)}`);
}

// ----- Context -----
export function RoomsProvider({ children }) {
  // קאש בזיכרון (לא יוצר רינדורים)
  const typesRef = useRef(null); // Array<{label,type,slug}>
  const roomsRef = useRef(new Map()); // Map<type, roomData>

  // סטייט תגובתי רק כשצריך לצייר מחדש
  const [typesState, setTypesState] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState(null);

  // טוען סוגי חדרים פעם אחת (לקרוא על פתיחת התפריט)
  const ensureTypes = useCallback(async () => {
    if (typesRef.current) return typesRef.current;
    setLoadingTypes(true);
    setTypesError(null);
    try {
      const data = await apiGetRoomTypes();
      typesRef.current = data;
      setTypesState(data); // רנדר אחד לעדכון
      return data;
    } catch (e) {
      setTypesError(e);
      throw e;
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // מביא חדר מהקאש או מהשרת ושומר
  const getRoom = useCallback(async (type) => {
    if (!type) throw new Error("type is required");
    if (roomsRef.current.has(type)) return roomsRef.current.get(type);
    const data = await apiGetRoomByType(type);
    roomsRef.current.set(type, data);
    return data;
  }, []);

  // עזר: הצצה מהירה מהקאש
  const peekRoom = useCallback(
    (type) => roomsRef.current.get(type) || null,
    []
  );

  // עזר: Prefetch בהובר על פריט תפריט
  const prefetchRoom = useCallback(async (type) => {
    if (!type || roomsRef.current.has(type)) return;
    try {
      const d = await apiGetRoomByType(type);
      roomsRef.current.set(type, d);
    } catch {}
  }, []);

  const value = useMemo(
    () => ({
      types: typesRef.current || typesState,
      loadingTypes,
      typesError,
      ensureTypes,
      getRoom,
      peekRoom,
      prefetchRoom,
    }),
    [
      typesState,
      loadingTypes,
      typesError,
      ensureTypes,
      getRoom,
      peekRoom,
      prefetchRoom,
    ]
  );

  return <RoomsCtx.Provider value={value}>{children}</RoomsCtx.Provider>;
}

export function useRooms() {
  const ctx = useContext(RoomsCtx);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
}

// הוק לטעינת חדר לפי type עם סטייט טעינה/שגיאה (ל- Room.jsx)
export function useRoom(type) {
  const { getRoom, peekRoom } = useRooms();
  const [data, setData] = useState(() => peekRoom(type));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    let alive = true;
    const cached = peekRoom(type);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getRoom(type)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setError(e);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [type]); // בכוונה לא מכניסים getRoom/peekRoom כדי לא לשבור memo

  return { data, loading, error };
}
