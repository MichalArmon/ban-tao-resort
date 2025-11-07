// src/context/UploadContext.jsx
import React, { createContext, useContext, useCallback, useMemo } from "react";
import { post } from "../config/api"; // משתמש ב-GLOBAL_API_BASE

const UploadCtx = createContext(null);

// בקשת חתימה מהשרת שלך
async function apiSignCloudinary(folder) {
  return post("/uploads/sign-cloudinary", { folder }); // server: /api/v1/uploads/sign-cloudinary
}

// העלאת קובץ יחיד → מחזיר public_id
async function uploadToCloudinary(file, folder) {
  const sig = await apiSignCloudinary(folder);
  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", sig.folder);
  fd.append("timestamp", sig.timestamp);
  fd.append("api_key", sig.apiKey);
  fd.append("signature", sig.signature);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const t = await res.text();
    throw new Error("Cloudinary upload failed: " + t);
  }
  const data = await res.json();
  return {
    public_id: data.public_id,
    original_filename: data.original_filename,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

export function UploadProvider({ children }) {
  const uploadImage = useCallback(async (file, folder) => {
    if (!file) throw new Error("No file provided");
    return uploadToCloudinary(file, folder);
  }, []);

  const uploadImages = useCallback(async (files, folder) => {
    const arr = Array.from(files || []).filter(Boolean);
    const results = [];
    for (const f of arr) {
      const data = await uploadToCloudinary(f, folder);
      results.push(data);
    }
    return results; // array of { public_id, secure_url, ... }
  }, []);

  const value = useMemo(
    () => ({ uploadImage, uploadImages }),
    [uploadImage, uploadImages]
  );
  return <UploadCtx.Provider value={value}>{children}</UploadCtx.Provider>;
}

export function useUpload() {
  const ctx = useContext(UploadCtx);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}
