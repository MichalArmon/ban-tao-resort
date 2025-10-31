import React, { createContext, useContext, useState, useCallback } from "react";
import { get, post, put, del } from "../config/api";

const CategoriesCtx = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // טען קטגוריות
  const loadCategories = useCallback(async (type) => {
    try {
      setLoading(true);
      const url = type ? `/categories?type=${type}` : "/categories";
      const res = await get(url);
      setCategories(res);
    } catch (err) {
      console.error("❌ Failed to load categories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // צור קטגוריה
  const createCategory = useCallback(async (data) => {
    try {
      const res = await post("/categories", data);
      setCategories((prev) => [...prev, res]);
      return res;
    } catch (err) {
      console.error("❌ Failed to create category:", err);
      throw err;
    }
  }, []);

  // עדכן קטגוריה
  const updateCategory = useCallback(async (id, data) => {
    try {
      const res = await put(`/categories/${id}`, data);
      setCategories((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...res } : c))
      );
    } catch (err) {
      console.error("❌ Failed to update category:", err);
      throw err;
    }
  }, []);

  // מחק קטגוריה
  const deleteCategory = useCallback(async (id) => {
    try {
      await del(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete category:", err);
      throw err;
    }
  }, []);

  return (
    <CategoriesCtx.Provider
      value={{
        categories,
        loading,
        error,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesCtx.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesCtx);
}
