import { useEffect, useState } from "react";
import { pub } from "../../utils/publicPath";

export default function useRoomsConfig() {
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); // מתחיל במצב טעינה
      setError(null); // מאפס שגיאות
      try {
        // ✅ טוען את rooms.json
        const res = await fetch(pub("rooms.json"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRooms(data || {});
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    }; // מערך תלויות ריק לוודא ריצה חד פעמית
  }, []);

  return { rooms, loading, error };
}
