// src/pages/admin/AdminRooms.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  TextField,
  Typography,
  IconButton,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import SaveIcon from "@mui/icons-material/Save";
import { post, put } from "../../config/api";
import { useUpload } from "../../context/UploadContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";

const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const cldUrl = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

const CURRENCIES = ["USD", "EUR", "ILS", "THB"];

export default function AdminRooms() {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    blurb: "",
    featuresCSV: "Wi-Fi, Air Conditioning",
    maxGuests: 2,
    sizeM2: 40,
    bedType: "Queen",
    priceBase: 250,
    currency: "USD",
    hero: "",
    images: [],
    stock: 1,
    active: true,
  });

  const { uploadImage, uploadImages } = useUpload();
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [touchedSlug, setTouchedSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // שמירה אוטומטית של slug מהכותרת
  useEffect(() => {
    if (touchedSlug) return;
    setForm((prev) => {
      const nextSlug = prev.title ? slugify(prev.title) : "";
      if (prev.slug === nextSlug) return prev;
      return { ...prev, slug: nextSlug };
    });
  }, [form.title, touchedSlug]);

  const hasValidSlug = /^[a-z0-9-]+$/.test(form.slug || "");

  const ensureSlug = () => {
    const s = (form.slug || slugify(form.title || "")).trim();
    if (!s || !/^[a-z0-9-]+$/.test(s)) {
      const msg = "קודם קבעי Slug תקין (אנגלית/ספרות/מקפים)";
      setErr(msg);
      throw new Error(msg);
    }
    return s;
  };

  const toPayload = () => {
    const features =
      form.featuresCSV
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    return {
      slug: form.slug || slugify(form.title),
      title: form.title,
      blurb: form.blurb,
      features,
      maxGuests: Number(form.maxGuests) || 0,
      sizeM2: Number(form.sizeM2) || 0,
      bedType: form.bedType,
      priceBase: Number(form.priceBase) || 0,
      currency: form.currency || "USD",
      hero: form.hero || "",
      images: (form.images || []).filter(Boolean),
      stock: Number(form.stock) || 0,
      active: !!form.active,
    };
  };

  const validate = () => {
    const p = toPayload();
    if (!p.title) return "חסר Title";
    if (!p.slug) return "חסר Slug";
    if (!/^[a-z0-9-]+$/.test(p.slug))
      return "Slug חייב להיות באנגלית, ספרות ומקפים בלבד";
    if (p.priceBase < 0) return "Price Base חייב להיות חיובי";
    if (p.maxGuests <= 0) return "Max Guests חייב להיות גדול מאפס";
    if (p.sizeM2 < 0) return "Size (m²) לא יכול להיות שלילי";
    if (!CURRENCIES.includes(p.currency)) return "מטבע לא נתמך";
    return "";
  };

  const handleSave = async (mode = "create") => {
    setOk("");
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    const payload = toPayload();

    try {
      if (mode === "create") {
        await post("/rooms/types", payload);
        setOk("נוצר בהצלחה ✅");
      } else {
        await put(`/rooms/types/${payload.slug}`, payload);
        setOk("עודכן בהצלחה ✅");
      }
    } catch (e) {
      setErr(e?.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const addImage = () => setField("images", [...(form.images || []), ""]);
  const removeImage = (idx) =>
    setField(
      "images",
      form.images.filter((_, i) => i !== idx)
    );
  const setImageAt = (idx, val) =>
    setField(
      "images",
      form.images.map((x, i) => (i === idx ? val : x))
    );

  const handlePickHero = () => heroInputRef.current?.click();
  const handlePickGallery = () => galleryInputRef.current?.click();

  // === Hero Upload ===
  const handleUploadHero = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const slug = ensureSlug();
      const folder = `ban-tao/rooms/${slug}`;
      const publicId = await uploadImage(file, folder, "hero_main");
      setField("hero", publicId);
      setOk("Hero הועלה ונשמר בהצלחה ✅");
      await handleSave("update"); // ⬅️ שמירה אוטומטית אחרי העלאה
    } catch (er) {
      setErr(er.message || "שגיאה בהעלאת Hero");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  // === Gallery Upload ===
  const handleUploadGallery = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    try {
      setSaving(true);
      const slug = ensureSlug();
      const folder = `ban-tao/rooms/${slug}`;
      const ids = await uploadImages(files, folder);
      const updatedImages = [...(form.images || []), ...ids];
      setField("images", updatedImages);
      setOk(`הועלו ${ids.length} תמונות ונשמרו ✅`);
      await handleSave("update"); // ⬅️ שמירה אוטומטית אחרי העלאה
    } catch (er) {
      setErr(er.message || "שגיאה בהעלאת גלריה");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ pt: "var(--nav-h)", px: { xs: 2, md: 4 }, pb: 6 }}>
      <Card variant="outlined">
        <CardHeader
          title="Room Type Editor"
          subheader="יצירה/עדכון של סוג חדר בהתאם למודל RoomType"
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* טופס שמאלי */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <TextField
                  label="Title (שם החדר)"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Slug (כתובת)"
                  value={form.slug}
                  onChange={(e) => {
                    setTouchedSlug(true);
                    setField("slug", slugify(e.target.value));
                  }}
                  helperText={
                    hasValidSlug
                      ? "אותיות באנגלית/ספרות/מקפים בלבד"
                      : "קודם קבעי Slug תקין"
                  }
                  fullWidth
                  error={Boolean(form.slug) && !hasValidSlug}
                />
                <TextField
                  label="Blurb (תיאור קצר)"
                  value={form.blurb}
                  onChange={(e) => setField("blurb", e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
                <TextField
                  label="Features (CSV)"
                  value={form.featuresCSV}
                  onChange={(e) => setField("featuresCSV", e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Max Guests"
                    type="number"
                    value={form.maxGuests}
                    onChange={(e) => setField("maxGuests", e.target.value)}
                    sx={{ maxWidth: 180 }}
                  />
                  <TextField
                    label="Size (m²)"
                    type="number"
                    value={form.sizeM2}
                    onChange={(e) => setField("sizeM2", e.target.value)}
                    sx={{ maxWidth: 180 }}
                  />
                </Stack>
                <TextField
                  label="Bed Type"
                  value={form.bedType}
                  onChange={(e) => setField("bedType", e.target.value)}
                  fullWidth
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Base Price"
                    type="number"
                    value={form.priceBase}
                    onChange={(e) => setField("priceBase", e.target.value)}
                    sx={{ maxWidth: 200 }}
                  />
                  <TextField
                    label="Currency"
                    select
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                    sx={{ maxWidth: 180 }}
                  >
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                    sx={{ maxWidth: 220 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.active}
                        onChange={(e) => setField("active", e.target.checked)}
                      />
                    }
                    label="Active"
                  />
                </Stack>
              </Stack>
            </Grid>

            {/* טופס ימני */}
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Hero Image
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handlePickHero}
                    startIcon={<AddPhotoAlternate />}
                    disabled={!hasValidSlug}
                  >
                    העלאת קובץ
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={heroInputRef}
                    onChange={handleUploadHero}
                    style={{ display: "none" }}
                  />
                </Stack>

                <TextField
                  placeholder="ban-tao/rooms/family-suite/hero_main"
                  value={form.hero}
                  onChange={(e) => setField("hero", e.target.value)}
                  fullWidth
                />
                {form.hero && (
                  <Box
                    component="img"
                    src={cldUrl(form.hero)}
                    alt="hero"
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                )}

                <Divider />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Gallery Images
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handlePickGallery}
                    startIcon={<AddPhotoAlternate />}
                    disabled={!hasValidSlug}
                  >
                    העלאת קבצים
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={galleryInputRef}
                    onChange={handleUploadGallery}
                    style={{ display: "none" }}
                  />
                </Stack>

                <Stack spacing={2}>
                  {(form.images || []).map((pid, idx) => (
                    <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 160,
                            height: 110,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {pid ? (
                            <img
                              src={cldUrl(pid)}
                              alt={`img-${idx}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                display: "grid",
                                placeItems: "center",
                                color: "text.secondary",
                                fontSize: 12,
                                height: "100%",
                              }}
                            >
                              No Preview
                            </Box>
                          )}
                        </Box>

                        <Stack flex={1} spacing={1}>
                          <TextField
                            label={`Public ID #${idx + 1}`}
                            value={pid}
                            onChange={(e) => setImageAt(idx, e.target.value)}
                            fullWidth
                          />
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ban-tao/rooms/deluxe-villa/2_abc12
                            </Typography>
                            <IconButton
                              color="error"
                              onClick={() => removeImage(idx)}
                              size="small"
                            >
                              <DeleteOutline />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Stack spacing={2}>
                {err && <Alert severity="error">{err}</Alert>}
                {ok && <Alert severity="success">{ok}</Alert>}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    onClick={() => handleSave("create")}
                  >
                    שמירה (יצירה)
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={saving}
                    onClick={() => handleSave("update")}
                  >
                    עדכון לפי slug
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
