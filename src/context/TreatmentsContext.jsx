import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { get, post, put, del } from "../config/api";

/* ============  API  ============ */
// דוגמה לפרמטרים: { q, category, intensity, isActive, limit, page, sort }
async function apiListTreatments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  // שימי לב: הטיפולים עובדים תחת /api/v1/treatments (כמו בשרת)
  return get(`/treatments${qs ? `?${qs}` : ""}`);
}
async function apiGetTreatment(idOrSlug) {
  return get(`/treatments/${encodeURIComponent(idOrSlug)}`);
}
async function apiCreateTreatment(payload) {
  return post(`/treatments`, payload);
}
async function apiUpdateTreatment(id, payload) {
  return put(`/treatments/${encodeURIComponent(id)}`, payload);
}
async function apiDeleteTreatment(id) {
  return del(`/treatments/${encodeURIComponent(id)}`);
}

/* ============  Context  ============ */
const TreatmentsCtx = createContext(null);

export function TreatmentsProvider({ children }) {
  // קאש לרשימה ולפריטים בודדים
  const cacheListRef = useRef(null);
  const cacheItemRef = useRef(new Map()); // slug/id -> item

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------- List ---------- */
  const listTreatments = useCallback(
    async (params = { isActive: true, sort: "title", limit: 200 }) => {
      try {
        setError(null);
        setLoading(true);
        const res = await apiListTreatments(params);
        // ה-controller שלנו מחזיר { items, total, page, pages }
        const next = res?.items ?? [];
        setItems(next);
        setTotal(res?.total ?? next.length);
        cacheListRef.current = { params, res };

        for (const it of next) {
          const key = it?.slug || it?._id;
          if (key) cacheItemRef.current.set(key, it);
        }
        return next;
      } catch (e) {
        console.error("listTreatments failed:", e);
        setError(e?.message || "Failed to load treatments");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ---------- Get one (by slug or id) ---------- */
  const getTreatment = useCallback(async (idOrSlug) => {
    if (!idOrSlug) return null;
    if (cacheItemRef.current.has(idOrSlug)) {
      return cacheItemRef.current.get(idOrSlug);
    }
    try {
      const doc = await apiGetTreatment(idOrSlug);
      const key = doc?.slug || doc?._id || idOrSlug;
      if (key) cacheItemRef.current.set(key, doc);
      return doc;
    } catch (e) {
      console.error("getTreatment failed:", e);
      throw e;
    }
  }, []);

  /* ---------- CRUD (לאדמין) ---------- */
  const createTreatment = useCallback(async (payload) => {
    const created = await apiCreateTreatment(payload);
    const key = created?.slug || created?._id;
    if (key) cacheItemRef.current.set(key, created);
    setItems((arr) => {
      const exists = arr.some((x) => (x.slug || x._id) === key);
      return exists
        ? arr.map((x) => ((x.slug || x._id) === key ? created : x))
        : [created, ...arr];
    });
    setTotal((t) => t + 1);
    return created;
  }, []);

  const updateTreatment = useCallback(async (id, payload) => {
    const updated = await apiUpdateTreatment(id, payload);
    const key = updated?.slug || updated?._id || id;
    if (key) cacheItemRef.current.set(key, updated);
    setItems((arr) =>
      arr.map((x) => (x._id === id || x.slug === id ? updated : x))
    );
    return updated;
  }, []);

  const deleteTreatment = useCallback(async (id) => {
    await apiDeleteTreatment(id);
    cacheItemRef.current.delete(id);
    setItems((arr) => arr.filter((x) => x._id !== id && x.slug !== id));
    setTotal((t) => Math.max(0, t - 1));
    return true;
  }, []);

  /* ---------- initial load ---------- */
  useEffect(() => {
    listTreatments({ isActive: true, sort: "title", limit: 200 });
  }, [listTreatments]);

  const value = useMemo(
    () => ({
      items,
      total,
      loading,
      error,
      listTreatments,
      getTreatment,
      createTreatment,
      updateTreatment,
      deleteTreatment,
    }),
    [
      items,
      total,
      loading,
      error,
      listTreatments,
      getTreatment,
      createTreatment,
      updateTreatment,
      deleteTreatment,
    ]
  );

  return (
    <TreatmentsCtx.Provider value={value}>{children}</TreatmentsCtx.Provider>
  );
}

export function useTreatments() {
  const ctx = useContext(TreatmentsCtx);
  if (!ctx)
    throw new Error("useTreatments must be used within TreatmentsProvider");
  return ctx;
}
