import { useEffect, useState } from "react";
import { get } from "../config/api"; // 👈 שימוש בעטיפה שלך

export default function useRoomsConfig() {
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // מושך מהשרת: GET {BASE}/rooms/types  (ה-BASE שלך כבר כולל /api/v1)
        const list = await get("/rooms/types"); // ← מחזיר array של room types
        // כדי לשמור התאמה ל-UI הקיים: map לפי הכותרת
        const map = Object.fromEntries(
          (list || []).map((x) => [x.label || x.title || x.slug, x])
        );
        if (!cancelled) setRooms(map);
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rooms, loading, error: error };
}
