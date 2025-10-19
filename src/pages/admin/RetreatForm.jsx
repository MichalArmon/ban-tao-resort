// 📁 src/pages/admin/AdminRetreats.jsx

// ---------------------------------------------
// 📁 src/pages/admin/RetreatForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
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
import AddIcon from "@mui/icons-material/Add";
import { post, put } from "../../config/api";
import { useUpload } from "../../context/UploadContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const TYPES = ["Yoga", "Detox", "Skiing", "Cooking", "Other"];

const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u0590-\u05FF\w\s-]/g, (m) => m) // שמירה על עברית
    .replace(/[^\u0590-\u05FF\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const cldUrl = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

export default function RetreatForm() {
  const [form, setForm] = useState({
    name: "",
    type: "Yoga",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(6, "day").format("YYYY-MM-DD"),
    color: "#66bb6a",
    price: 2200,
    capacity: 0,
    spotsLeft: 0,
    isPrivate: true,
    isClosed: false,
    published: true,
    hero: "",
    gallery: [],
    blurb: "",
    description: "",
    featuresCSV: "Daily yoga, Meditation, Sauna access",
  });

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Upload helpers (from UploadContext)
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

  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const setField = (key, value) =>
    setForm((p) => ({
      ...p,
      [key]: value,
    }));

  const nameSlug = useMemo(() => slugify(form.name || ""), [form.name]);

  // Build payload to API
  const toPayload = () => {
    const cleanCSV = (s = "") =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const start = dayjs(form.startDate).toDate();
    const end = dayjs(form.endDate).toDate();

    if (!dayjs(start).isValid() || !dayjs(end).isValid())
      throw new Error("תאריכים לא תקינים");
    if (end < start) throw new Error("תאריך סיום לפני התחלה");

    return {
      name: form.name?.trim(),
      type: form.type,
      startDate: start,
      endDate: end,
      color: form.color || "#66bb6a",
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || undefined,
      spotsLeft: Number(form.spotsLeft) || undefined,
      isPrivate: !!form.isPrivate,
      isClosed: !!form.isClosed,
      published: !!form.published,
      hero: form.hero || "",
      gallery: Array.isArray(form.gallery)
        ? form.gallery.map((x) => ({ url: cldUrl(x), alt: "", publicId: x }))
        : [],
      blurb: form.blurb?.trim() || "",
      description: form.description?.trim() || "",
      features: cleanCSV(form.featuresCSV),
    };
  };

  const handleSave = async (mode = "create") => {
    setErr("");
    setOk("");

    let p;
    try {
      p = toPayload();
    } catch (e) {
      return setErr(e?.message || "Form build error");
    }

    if (!p.name) return setErr("חסר name");

    setSaving(true);
    try {
      const url =
        "/retreats" +
        (mode === "update" ? `/${encodeURIComponent(p._id || "")}` : "");

      const res = mode === "create" ? await post(url, p) : await put(url, p);
      setOk(mode === "create" ? "✅ ריטריט נוצר" : "✅ ריטריט עודכן");
      console.log("save ok:", res);
    } catch (e) {
      console.error("save error:", e);
      setErr(e?.response?.data?.message || e.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  // --- HERO UPLOAD ---
  const onUploadHero = async (file) => {
    if (!file || !form.name) return;
    setSaving(true);
    try {
      const folder = `ban-tao/retreats/${nameSlug}`;
      const id = await uploadImage(file, folder, "hero_main");
      setField("hero", id);
      setOk("Hero image הועלה ✅");
    } catch (err) {
      setErr(err.message || "שגיאה בהעלאת Hero");
    } finally {
      setSaving(false);
    }
  };

  // --- GALLERY UPLOAD ---
  const onUploadGallery = async (files) => {
    if (!files?.length || !form.name) return;
    setSaving(true);
    try {
      const folder = `ban-tao/retreats/${nameSlug}`;
      const ids = await uploadImages(files, folder);
      setField("gallery", [...form.gallery, ...ids]);
      setOk(`הועלו ${ids.length} תמונות לגלריה ✅`);
    } catch (err) {
      setErr(err.message || "שגיאה בהעלאת גלריה");
    } finally {
      setSaving(false);
    }
  };

  // --- Minimal schedule editor (admin) ---
  const [newAct, setNewAct] = useState({
    time: "09:00",
    title: "",
    kind: "class",
    durationMin: 60,
    location: "",
  });
  const [scheduleIso, setScheduleIso] = useState(
    dayjs(form.startDate).format("YYYY-MM-DD")
  );

  const ensureSchedule = async () => {
    try {
      await post(
        `/retreats/${encodeURIComponent(form._id || "temp")}/schedule/ensure`
      );
    } catch (e) {
      // אם עדיין אין _id (כי זה חדש), אין מה להבטיח
    }
  };

  const addActivity = async () => {
    try {
      const payload = {
        ...newAct,
        durationMin: Number(newAct.durationMin) || undefined,
      };
      if (!form._id)
        return setErr("צריך לשמור את הריטריט קודם כדי להוסיף פעילויות");
      const day = await post(
        `/retreats/${form._id}/schedule/day/${scheduleIso}/activities`,
        payload
      );
      setOk("הפעילות נוספה ✅");
      console.log("day:", day);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    }
  };

  // UI
  return (
    <>
      {/* Col 1: Basic fields */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <TextField
            label="Name (שם הריטריט)"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Type"
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
            fullWidth
          >
            {TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
              sx={{ maxWidth: 220 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(e) => setField("endDate", e.target.value)}
              sx={{ maxWidth: 220 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Color"
              type="color"
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
              sx={{ width: 120 }}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setField("price", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
            />
            <TextField
              label="Capacity"
              type="number"
              value={form.capacity}
              onChange={(e) => setField("capacity", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
            />
            <TextField
              label="Spots Left"
              type="number"
              value={form.spotsLeft}
              onChange={(e) => setField("spotsLeft", Number(e.target.value))}
              sx={{ maxWidth: 180 }}
            />
          </Stack>

          <FormControlLabel
            control={
              <Switch
                checked={form.published}
                onChange={(e) => setField("published", e.target.checked)}
              />
            }
            label="Published"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isPrivate}
                onChange={(e) => setField("isPrivate", e.target.checked)}
              />
            }
            label="Private"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isClosed}
                onChange={(e) => setField("isClosed", e.target.checked)}
              />
            }
            label="Closed"
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
            label="Description (תיאור מלא)"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
          <TextField
            label="Features (CSV)"
            value={form.featuresCSV}
            onChange={(e) => setField("featuresCSV", e.target.value)}
            fullWidth
          />
        </Stack>
      </Grid>

      {/* Col 2: Hero + Gallery + Schedule (mini) */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          {/* Hero */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Hero Image
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => heroInputRef.current?.click()}
              disabled={!form.name}
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
                e.target.value = "";
                if (!file) return;
                await onUploadHero(file);
              }}
            />
          </Stack>

          <TextField
            label="Hero Public ID"
            value={form.hero}
            onChange={(e) => setField("hero", e.target.value)}
            fullWidth
            placeholder={`ban-tao/retreats/${nameSlug}/hero_main`}
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

          {/* Gallery */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Gallery Images
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => galleryInputRef.current?.click()}
              disabled={!form.name}
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
                e.target.value = "";
                if (!files?.length) return;
                await onUploadGallery(files);
              }}
            />
          </Stack>

          <Stack spacing={2}>
            {(form.gallery || []).map((pid, idx) => (
              <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                          "gallery",
                          form.gallery.map((x, i) => (i === idx ? newVal : x))
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
                            "gallery",
                            form.gallery.filter((_, i) => i !== idx)
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

          <Divider />

          {/* Mini schedule editor (create activity) */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Schedule (mini)
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date (ISO)"
              type="date"
              value={scheduleIso}
              onChange={(e) => setScheduleIso(e.target.value)}
              sx={{ maxWidth: 220 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Time"
              value={newAct.time}
              onChange={(e) =>
                setNewAct((p) => ({ ...p, time: e.target.value }))
              }
              sx={{ maxWidth: 140 }}
              placeholder="HH:mm"
            />
            <TextField
              label="Title"
              value={newAct.title}
              onChange={(e) =>
                setNewAct((p) => ({ ...p, title: e.target.value }))
              }
              sx={{ minWidth: 220 }}
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Kind"
              select
              value={newAct.kind}
              onChange={(e) =>
                setNewAct((p) => ({ ...p, kind: e.target.value }))
              }
              sx={{ maxWidth: 180 }}
            >
              {[
                { v: "class", t: "Class" },
                { v: "treatment", t: "Treatment" },
                { v: "meal", t: "Meal" },
                { v: "break", t: "Break" },
                { v: "event", t: "Event" },
                { v: "note", t: "Note" },
              ].map((o) => (
                <MenuItem key={o.v} value={o.v}>
                  {o.t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Duration (min)"
              type="number"
              value={newAct.durationMin}
              onChange={(e) =>
                setNewAct((p) => ({
                  ...p,
                  durationMin: Number(e.target.value),
                }))
              }
              sx={{ maxWidth: 180 }}
            />
            <TextField
              label="Location"
              value={newAct.location}
              onChange={(e) =>
                setNewAct((p) => ({ ...p, location: e.target.value }))
              }
              sx={{ minWidth: 220 }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addActivity}
            >
              הוספת פעילות
            </Button>
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
              עדכון
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            הפעולה שומרת ל־MongoDB דרך API ל־<code>Retreat</code>. ליצירת
            פעילויות יש לשמור קודם כדי לקבל <code>_id</code>.
          </Typography>
        </Stack>
      </Grid>
    </>
  );
}
