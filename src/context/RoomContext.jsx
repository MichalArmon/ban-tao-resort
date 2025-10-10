// src/context/RoomsContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { get, post, put, del } from "../config/api"; // משתמש ב- GLOBAL_API_BASE

const RoomsCtx = createContext(null);

// ----- API (אותו קובץ) -----
// קריאות קריאה (GET)
async function apiGetRoomTypes() {
  // החזר לדוגמה: [{slug,title,blurb,...}]
  return get("/rooms/types");
}
async function apiGetRoomByType(type) {
  // החזר לדוגמה: { slug, title, hero, images, features, ... }
  return get(`/rooms/${encodeURIComponent(type)}`);
}

// קריאות כתיבה לאדמין (CRUD)
async function apiCreateRoomType(payload) {
  // POST /rooms/types → מחזיר ה- RoomType שנוצר
  return post("/rooms/types", payload);
}
async function apiUpdateRoomType(slug, payload) {
  // PUT /rooms/types/:slug → מחזיר המעודכן
  return put(`/rooms/types/${encodeURIComponent(slug)}`, payload);
}
async function apiDeleteRoomType(slug) {
  // DELETE /rooms/types/:slug → 204/200
  return del(`/rooms/types/${encodeURIComponent(slug)}`);
}

// ----- Context Provider -----
// מאחסן קאש בזיכרון + API מרוכז ל-UI
export function RoomsProvider({ children }) {
  // קאש בזיכרון (לא יוצר רינדורים)
  const typesRef = useRef(null); // Array<RoomType>
  const roomsRef = useRef(new Map()); // Map<type/slug, roomData>

  // סטייט תגובתי רק כשצריך לצייר מחדש
  const [typesState, setTypesState] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState(null);

  // טוען סוגי חדרים פעם אחת (לקרוא על פתיחת התפריט/מסך)
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

  // טעינה מחדש מפורשת (למשל אחרי יצירה/עדכון/מחיקה)
  const reloadTypes = useCallback(async () => {
    typesRef.current = null;
    setTypesState(null);
    return ensureTypes();
  }, [ensureTypes]);

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
    } catch {
      // שקט – פריפץ' לא חייב להפיל את ה-UI
    }
  }, []);

  // ===== פעולות אדמין (CRUD) =====
  const createType = useCallback(
    async (payload) => {
      const created = await apiCreateRoomType(payload);
      // נקה קאש של אותו slug/type (אם קיים) ורענן רשימה
      if (created?.slug) roomsRef.current.delete(created.slug);
      await reloadTypes();
      return created;
    },
    [reloadTypes]
  );

  const updateType = useCallback(
    async (slug, payload) => {
      const updated = await apiUpdateRoomType(slug, payload);
      // נקה קאש של הישן
      roomsRef.current.delete(slug);
      // ואם השתנה slug – ננקה גם את החדש כדי למשוך טרי בפעם הבאה
      if (updated?.slug && updated.slug !== slug) {
        roomsRef.current.delete(updated.slug);
      }
      await reloadTypes();
      return updated;
    },
    [reloadTypes]
  );

  const deleteType = useCallback(
    async (slug) => {
      await apiDeleteRoomType(slug);
      roomsRef.current.delete(slug);
      await reloadTypes();
    },
    [reloadTypes]
  );

  const value = useMemo(
    () => ({
      // קריאה
      types: typesRef.current || typesState,
      loadingTypes,
      typesError,
      ensureTypes,
      getRoom,
      peekRoom,
      prefetchRoom,
      // כתיבה לאדמין
      createType,
      updateType,
      deleteType,
      reloadTypes,
    }),
    [
      typesState,
      loadingTypes,
      typesError,
      ensureTypes,
      getRoom,
      peekRoom,
      prefetchRoom,
      createType,
      updateType,
      deleteType,
      reloadTypes,
    ]
  );

  return <RoomsCtx.Provider value={value}>{children}</RoomsCtx.Provider>;
}

// ----- Hooks -----
export function useRooms() {
  const ctx = useContext(RoomsCtx);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
}

// הוק לטעינת חדר לפי type עם סטייט טעינה/שגיאה (לשימוש ב- Room.jsx)
export function useRoom(type) {
  const { getRoom, peekRoom } = useRooms();
  const [data, setData] = useState(() => (type ? peekRoom(type) : null));
  const [loading, setLoading] = useState(Boolean(type) && !peekRoom(type));
  const [error, setError] = useState(null);

  React.useEffect(() => {
    let alive = true;
    if (!type) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

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
    // בכוונה לא מכניסים getRoom/peekRoom כדי לא לשבור memo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return { data, loading, error };
}
