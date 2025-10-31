import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { get, post, put } from "../config/api";

/**
 * ScheduleContext — משותף לאדמין ולאורחים.
 * כולל: 1) Grid CRUD (אדמין), 2) טעינת סשנים מתוארכים (אורחים).
 */

const ScheduleCtx = createContext(null);

export function ScheduleProvider({ children }) {
  // סטייט עבור לוח ידני (אדמין)
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // סטייט עבור לוח סשנים מתוארכים (אורחים) ⬅️ חדש
  const [guestSchedule, setGuestSchedule] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);

  const [error, setError] = useState(null);

  const WEEK_KEY =
    "default"; /* ---------- טעינת לוח (הגריד הידני של האדמין) ---------- */ // מפתח הגריד הידני

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // 🎯 קריאה ל-GET /schedule/grid

      const res = await get(`/schedule/grid?weekKey=${WEEK_KEY}`);
      const data = res?.grid || res || {};
      setGrid(data);
    } catch (e) {
      console.error("❌ Failed to load schedule:", e);
      setError(e.message || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- טעינת לוח אמיתי לאורחים (מתוארך) ---------- */ // ⬅️ חדש
  /**
   * @param {string} from - YYYY-MM-DD
   * @param {string} to - YYYY-MM-DD
   */
  const loadGuestSchedule = useCallback(async (from, to) => {
    if (!from || !to) {
      console.log("⚠️ missing from/to", from, to);
      return;
    }
    try {
      setGuestLoading(true);
      setError(null);

      const url = `/schedule?from=${from}&to=${to}`;
      console.log("🌐 Fetching guest schedule:", url);
      const res = await get(url);
      console.log("✅ Guest schedule response:", res);

      setGuestSchedule(res || []);
    } catch (e) {
      console.error("❌ Failed to load guest schedule:", e);
      setError(e.message || "Failed to load guest schedule");
    } finally {
      setGuestLoading(false);
    }
  }, []);
  /* ---------- שמירה מלאה (POST) ---------- */

  const saveSchedule = useCallback(
    async (nextGrid = grid) => {
      try {
        setSaving(true);
        setError(null);
        const payload = { weekKey: WEEK_KEY, grid: nextGrid }; // 🎯 קריאה ל-POST /schedule/grid
        const res = await post("/schedule/grid", payload);
        setGrid(res?.grid || nextGrid);
      } catch (e) {
        console.error("❌ Failed to save schedule:", e);
        setError(e.message || "Failed to save schedule");
      } finally {
        setSaving(false);
      }
    },
    [grid]
  ); /* ---------- עדכון תא בודד (PUT) ---------- */

  const saveCell = useCallback(async (day, hour, studio, value) => {
    try {
      setError(null); // 🎯 קריאה ל-PUT /schedule/grid/cell
      await put("/schedule/grid/cell", {
        weekKey: WEEK_KEY,
        day,
        hour,
        studio,
        value,
      });

      setGrid((prev) => ({
        ...prev,
        [day]: {
          ...(prev[day] || {}),
          [hour]: {
            ...(prev[day]?.[hour] || {}),
            [studio]: value,
          },
        },
      }));
    } catch (e) {
      console.error("❌ Failed to update cell:", e);
      setError(e.message || "Failed to update cell");
    }
  }, []); /* ---------- טעינה אוטומטית (עבור גריד אדמין) ---------- */

  useEffect(() => {
    // מפעיל את טעינת הגריד רק בפעם הראשונה
    loadSchedule();
  }, [loadSchedule]);

  return (
    <ScheduleCtx.Provider
      value={{
        // Admin Grid States & Functions
        grid,
        setGrid,
        loading,
        saving,
        loadSchedule,
        saveSchedule,
        saveCell,

        // Guest Schedule States & Functions ⬅️ חדש
        guestSchedule,
        guestLoading,
        loadGuestSchedule,

        error, // Shared error state
      }}
    >
      {children}
    </ScheduleCtx.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleCtx);
  if (!ctx) throw new Error("useSchedule must be used within ScheduleProvider");
  return ctx;
}
