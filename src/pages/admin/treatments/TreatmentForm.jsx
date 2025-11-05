import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Grid,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  Divider,
  Button,
  Card,
  IconButton,
  Alert,
  Chip,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTreatments } from "../../../context/TreatmentsContext";
import { useUpload } from "../../../context/UploadContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const cldUrl = (publicId) =>
  publicId
    ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`
    : "";

const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .replace(/[\u0590-\u05FF\w\s-]/g, (m) => m)
    .replace(/[^\u0590-\u05FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

const INTENSITY_OPTS = [
  { value: "gentle", label: "gentle" },
  { value: "moderate", label: "moderate" },
  { value: "deep", label: "deep" },
];

const CATEGORY_PRESETS = [
  "massage",
  "ice-bath",
  "hydro",
  "breathwork",
  "sound",
  "facial",
  "bodywork",
];

const CONTRA_PRESETS = [
  "pregnancy",
  "hypertension",
  "fever",
  "acute-inflammation",
  "recent-surgery",
  "open-wounds",
];

const CURRENCY_PRESETS = ["THB", "USD", "EUR", "ILS"];

export default function TreatmentForm({
  id = null,
  initialData = null,
  onSaved = () => {},
  onCancel = null,
}) {
  const { createTreatment, updateTreatment, getTreatment } = useTreatments();
  const uploadCtx =
    (typeof useUpload === "function" ? useUpload() : null) || {};
  const uploadImage =
    uploadCtx.uploadImage ??
    (async () => {
      throw new Error("Upload not available");
    });
  const uploadImages =
    uploadCtx.uploadImages ??
    (async () => {
      throw new Error("Upload not available");
    });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    therapist: "",
    durationMinutes: 60,
    level: "all",
    price: "",
    currency: "THB",
    isActive: true,
    isPrivate: false,
    isClosed: false,
    description: "",
    bullets: [],
    tags: [],
    intensity: "gentle",
    contraindications: [],
    heroPid: "",
    galleryPids: [],
  });

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const nameSlug = useMemo(() => slugify(form.title || ""), [form.title]);

  /* ---------- Load for edit ---------- */
  useEffect(() => {
    let ignore = false;
    const loadOne = async () => {
      if (!id && !initialData) return;
      try {
        const data = initialData || (await getTreatment(id));
        if (ignore || !data) return;
        setForm((p) => ({
          ...p,
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "",
          therapist: data.therapist || "",
          durationMinutes: data.durationMinutes || 60,
          level: data.level || "all",
          price: data.price ?? "",
          currency: data.currency || "THB",
          isActive: !!data.isActive,
          isPrivate: !!data.isPrivate,
          isClosed: !!data.isClosed,
          description: data.description || "",
          bullets: Array.isArray(data.bullets) ? data.bullets : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          intensity: data.intensity || "gentle",
          contraindications: Array.isArray(data.contraindications)
            ? data.contraindications
            : [],
          heroPid: data.hero?.publicId || "",
          galleryPids: Array.isArray(data.gallery)
            ? data.gallery.map((g) => g.publicId || "").filter(Boolean)
            : [],
        }));
      } catch (e) {
        setErr(e?.message || "Failed to load treatment");
      }
    };
    loadOne();
    return () => {
      ignore = true;
    };
  }, [id, initialData, getTreatment]);

  /* ---------- Auto slug ---------- */
  useEffect(() => {
    setForm((f) => {
      if (!f.title) return f;
      if (f.slug && f.slug !== slugify(f.title)) return f;
      return { ...f, slug: slugify(f.title) };
    });
  }, [form.title]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ---------- Payload builder ---------- */
  const toPayload = () => {
    const heroObj = form.heroPid
      ? { publicId: form.heroPid, url: cldUrl(form.heroPid), alt: form.title }
      : {};
    const galleryObjs = (form.galleryPids || []).filter(Boolean).map((pid) => ({
      publicId: pid,
      url: cldUrl(pid),
      alt: form.title || "",
    }));

    return {
      title: (form.title || "").trim(),
      slug: (form.slug || nameSlug || "").trim(),
      category: form.category || "",
      therapist: form.therapist || "",
      duration: form.durationMinutes ? `${form.durationMinutes} min` : "",
      durationMinutes: Number(form.durationMinutes) || 0,
      level: form.level || "all",
      price: form.price === "" ? undefined : Number(form.price),
      currency: form.currency || "THB",
      isActive: !!form.isActive,
      isPrivate: !!form.isPrivate,
      isClosed: !!form.isClosed,
      description: (form.description || "").trim(),
      bullets: (form.bullets || []).filter(Boolean),
      tags: (form.tags || []).filter(Boolean),
      intensity: form.intensity || "gentle",
      contraindications: (form.contraindications || []).filter(Boolean),
      hero: heroObj,
      gallery: galleryObjs,
    };
  };

  /* ---------- Save ---------- */
  const handleSave = async () => {
    setErr("");
    setOk("");
    const payload = toPayload();
    if (!payload.title) return setErr("Title is required");
    try {
      setSaving(true);
      const res = id
        ? await updateTreatment(id, payload)
        : await createTreatment(payload);
      setOk(id ? "✅ Treatment updated" : "✅ Treatment created");
      onSaved(res);
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Uploads ---------- */
  const onUploadHero = async (file) => {
    if (!file || !form.title) return;
    try {
      const folder = `ban-tao/treatments/${nameSlug}`;
      const up = await uploadImage(file, folder, "hero_main");
      setField("heroPid", up.public_id);
      setOk("Hero uploaded ✅");
    } catch (e) {
      setErr(e.message || "Hero upload failed");
    }
  };

  const onUploadGallery = async (files) => {
    if (!files?.length || !form.title) return;
    try {
      const folder = `ban-tao/treatments/${nameSlug}`;
      const ups = await uploadImages(files, folder);
      const pids = ups.map((u) => u.public_id).filter(Boolean);
      setField("galleryPids", [...form.galleryPids, ...pids]);
      setOk(`Uploaded ${pids.length} gallery images ✅`);
    } catch (e) {
      setErr(e.message || "Gallery upload failed");
    }
  };

  /* ---------- UI ---------- */
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">
          {id ? "Edit Treatment" : "New Treatment"}
        </Typography>
        {onCancel && (
          <Button size="small" startIcon={<CloseIcon />} onClick={onCancel}>
            Close
          </Button>
        )}
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}
      {ok && <Alert severity="success">{ok}</Alert>}

      {/* כל שאר הטופס נשאר בדיוק כפי שהיה */}
      {/* ... (שדות, תמונות, תגים וכו') ... */}

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {id ? "Save changes" : "Create treatment"}
        </Button>
      </Stack>
    </Box>
  );
}
