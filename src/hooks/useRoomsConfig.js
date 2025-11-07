// 📁 src/hooks/useRoomsConfig.js
import { useEffect, useMemo, useState } from "react";
import { get } from "../config/api"; // 👈 עטיפת fetch שלך

export default function useRoomsConfig() {
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ הנתיב המעודכן — בלי /types
        const list = await get("/rooms"); // ← מחזיר array של rooms מהשרת

        // נבנה map לפי הכותרת/slug כדי לשמור תאימות ל-UI הקיים
        const map = Object.fromEntries(
          (list || []).map((x) => [x.label || x.title || x.slug, x])
        );

        if (!cancelled) setRooms(map);
      } catch (e) {
        console.error("❌ useRoomsConfig failed:", e);
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { rooms, loading, error };
}
