// 📁 src/pages/admin/RoomForm.jsx
import React, { useEffect, useState, useRef } from "react";
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
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { post, put } from "../../config/api";
import { useUpload } from "../../context/UploadContext";

// קבועים
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const CURRENCIES = ["USD", "EUR", "ILS", "THB"];

// פונקציית slugify
const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// URL לתמונה מתוך Cloudinary
const cldUrl = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

export default function RoomForm() {
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

  const [touchedSlug, setTouchedSlug] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // העלאת תמונות (fallback עדין אם אין Provider)
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

  // רפרנסים לשדות קובץ
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // שדה עזר לעדכון טופס
  const setField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  // אם המשתמש לא שינה ידנית את ה-slug, נעדכן אותו אוטומטית לפי title
  useEffect(() => {
    if (touchedSlug) return;
    const nextSlug = slugify(form.title);
    setForm((prev) =>
      prev.slug === nextSlug ? prev : { ...prev, slug: nextSlug }
    );
  }, [form.title, touchedSlug]);

  // ממיר את מצב הטופס ל־payload תקין לשרת
  const toPayload = () => {
    const cleanCSV = (s = "") =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    return {
      title: form.title?.trim(),
      slug: form.slug?.trim(),
      blurb: form.blurb?.trim() || "",
      features: cleanCSV(form.featuresCSV),

      // מספרים – לוודא המרה
      maxGuests: Number(form.maxGuests) || 0,
      sizeM2: Number(form.sizeM2) || 0,
      bedType: form.bedType?.trim() || "",
      priceBase: Number(form.priceBase) || 0,
      currency: form.currency || "USD",

      // מזהי Cloudinary (publicId)
      hero: form.hero || "",
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],

      stock: Number(form.stock) || 0,
      active: !!form.active,
    };
  };

  const handleSave = async (mode = "create") => {
    setErr("");
    setOk("");

    let p;
    try {
      p = toPayload();
    } catch (e) {
      console.error("toPayload error", e);
      return setErr(e?.message || "Form build error");
    }

    // ולידציה בסיסית
    if (!p.title) return setErr("חסר title");
    if (!p.slug) return setErr("חסר slug");
    if (!/^[a-z0-9-]+$/.test(p.slug)) return setErr("Slug לא תקין");
    if (p.maxGuests <= 0) return setErr("Guests חייב להיות מעל 0");

    setSaving(true);
    try {
      const url = mode === "create" ? "/rooms/types" : `/rooms/types/${p.slug}`;
      const res = mode === "create" ? await post(url, p) : await put(url, p);

      console.log("save ok:", res);
      setOk(mode === "create" ? "✅ נוצר בהצלחה" : "✅ עודכן בהצלחה");
    } catch (e) {
      console.error("save error:", e);
      setErr(e?.response?.data?.message || e.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  // UI
  return (
    <>
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <TextField
            label="Title (שם החדר)"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            fullWidth
          />

          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setTouchedSlug(true);
              setField("slug", slugify(e.target.value));
            }}
            fullWidth
            helperText="כתובת ייחודית באנגלית בלבד"
          />

          <TextField
            label="Blurb (תיאור קצר)"
            value={form.blurb}
            onChange={(e) => setField("blurb", e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <TextField
            label="Features (CSV)"
            value={form.featuresCSV}
            onChange={(e) => setField("featuresCSV", e.target.value)}
            fullWidth
            placeholder="Wi-Fi, Air Conditioning"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Max Guests"
              type="number"
              value={form.maxGuests}
              onChange={(e) => setField("maxGuests", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
            />
            <TextField
              label="Size (m²)"
              type="number"
              value={form.sizeM2}
              onChange={(e) => setField("sizeM2", Number(e.target.value))}
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
              label="Price"
              type="number"
              value={form.priceBase}
              onChange={(e) => setField("priceBase", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
            />
            <TextField
              select
              label="Currency"
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
              sx={{ maxWidth: 160 }}
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
              onChange={(e) => setField("stock", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
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

      {/* Col 2: Hero Image + Gallery */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          {/* Hero Upload */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Hero Image
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => heroInputRef.current?.click()}
              disabled={!form.slug}
            >
              העלאת Hero
            </Button>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !form.slug) return;
                setSaving(true);
                try {
                  const folder = `ban-tao/rooms/${form.slug}`;
                  const id = await uploadImage(file, folder, "hero_main");
                  setField("hero", id);
                  setOk("Hero image הועלה ✅");
                } catch (err) {
                  setErr(err.message || "שגיאה בהעלאת Hero");
                } finally {
                  setSaving(false);
                  e.target.value = "";
                }
              }}
            />
          </Stack>

          <TextField
            label="Hero Public ID"
            value={form.hero}
            onChange={(e) => setField("hero", e.target.value)}
            fullWidth
            placeholder="ban-tao/rooms/suite-name/hero_main"
          />

          {form.hero && (
            <Box
              component="img"
              src={cldUrl(form.hero)}
              alt="Hero Preview"
              sx={{
                width: "100%",
                height: 200,
                objectFit: "cover",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          )}

          <Divider />

          {/* Gallery Upload */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Gallery Images
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => galleryInputRef.current?.click()}
              disabled={!form.slug}
            >
              העלאת גלריה
            </Button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                if (!files?.length || !form.slug) return;
                setSaving(true);
                try {
                  const folder = `ban-tao/rooms/${form.slug}`;
                  const ids = await uploadImages(files, folder);
                  setField("images", [...form.images, ...ids]);
                  setOk(`הועלו ${ids.length} תמונות לגלריה ✅`);
                } catch (err) {
                  setErr(err.message || "שגיאה בהעלאת גלריה");
                } finally {
                  setSaving(false);
                  e.target.value = "";
                }
              }}
            />
          </Stack>

          {/* Gallery List */}
          <Stack spacing={2}>
            {(form.images || []).map((pid, idx) => (
              <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
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
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems: "center",
                          color: "text.secondary",
                          fontSize: 12,
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
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setField(
                          "images",
                          form.images.map((x, i) => (i === idx ? newVal : x))
                        );
                      }}
                      fullWidth
                    />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        מזהה Cloudinary לשורה זו
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setField(
                            "images",
                            form.images.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Grid>

      {/* Actions + Alerts */}
      <Grid item xs={12}>
        <Stack spacing={2}>
          {err && <Alert severity="error">{err}</Alert>}
          {ok && <Alert severity="success">{ok}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSave("create")}
              disabled={saving}
              startIcon={<SaveIcon />}
            >
              יצירה
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSave("update")}
              disabled={saving}
            >
              עדכון לפי Slug
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            הפעולה שומרת ל־MongoDB דרך API ל־<code>RoomType</code>
          </Typography>
        </Stack>
      </Grid>
    </>
  );
}
