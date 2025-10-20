// 📁 src/pages/admin/TreatmentForm.jsx
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
import { post, put, get } from "../../config/api";
import { useUpload } from "../../context/UploadContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const cldUrl = (publicId) =>
  publicId
    ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`
    : "";

const slugify = (s = "") =>
  s
    .toString()
    .trim()
    // שומר עברית + תווים נפוצים, מוריד יתר
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
    // UI מחזיק רק מזהי Cloudinary; נמיר ב־payload
    heroPid: "",
    galleryPids: [],
  });

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const nameSlug = useMemo(() => slugify(form.title || ""), [form.title]);

  // טעינת ישן לעריכה
  useEffect(() => {
    let ignore = false;
    const loadOne = async () => {
      if (!id && !initialData) return;
      try {
        const data =
          initialData || (await get(`/api/v1/treatments/${id}`))?.data;
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
        setErr(
          e?.response?.data?.error || e.message || "Failed to load treatment"
        );
      }
    };
    loadOne();
    return () => {
      ignore = true;
    };
  }, [id, initialData]);

  // שמירת slug אוטומטי כשהכותרת משתנה (אם לא לעריכה ידנית)
  useEffect(() => {
    setForm((f) => {
      if (!f.title) return f;
      if (f.slug && f.slug !== slugify(f.title)) return f;
      return { ...f, slug: slugify(f.title) };
    });
  }, [form.title]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Build payload → ממיר publicId-ים לאובייקטי תמונה לסכמה
  const toPayload = () => {
    const heroObj = form.heroPid
      ? {
          publicId: form.heroPid,
          url: cldUrl(form.heroPid),
          alt: form.title || "",
        }
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

  const handleSave = async () => {
    setErr("");
    setOk("");
    const payload = toPayload();
    if (!payload.title) return setErr("Title is required");
    try {
      setSaving(true);
      const res = id
        ? await put(`/api/v1/treatments/${id}`, payload)
        : await post(`/api/v1/treatments`, payload);
      setOk(id ? "✅ Treatment updated" : "✅ Treatment created");
      onSaved(res?.data);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Uploads (שומר publicId-ים בלבד ב-UI; השרת יקבל כבר אובייקטים)
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

  // UI
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

      {err ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      ) : null}
      {ok ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {ok}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        {/* Left */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <TextField
              label="Title (שם הטיפול)"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              helperText={`Generated from title: ${nameSlug}`}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                select
                fullWidth
              >
                {CATEGORY_PRESETS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Therapist"
                value={form.therapist}
                onChange={(e) => setField("therapist", e.target.value)}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setField("durationMinutes", Number(e.target.value || 0))
                }
                inputProps={{ min: 10, max: 300, step: 5 }}
                fullWidth
              />
              <TextField
                label="Intensity"
                value={form.intensity}
                onChange={(e) => setField("intensity", e.target.value)}
                select
                fullWidth
              >
                {INTENSITY_OPTS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                fullWidth
              />
              <TextField
                label="Currency"
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                select
                fullWidth
              >
                {CURRENCY_PRESETS.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPrivate}
                    onChange={(e) => setField("isPrivate", e.target.checked)}
                  />
                }
                label="Private (by request)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isClosed}
                    onChange={(e) => setField("isClosed", e.target.checked)}
                  />
                }
                label="Closed (temporarily)"
              />
            </Stack>

            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />

            {/* Bullets */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Highlights (bullets)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", mb: 1 }}
              >
                {form.bullets.map((b, i) => (
                  <Chip
                    key={`${b}-${i}`}
                    label={b}
                    onDelete={() =>
                      setField(
                        "bullets",
                        form.bullets.filter((_, idx) => idx !== i)
                      )
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add bullet"
                  value={form._newBullet || ""}
                  onChange={(e) => setField("_newBullet", e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const v = (form._newBullet || "").trim();
                    if (!v) return;
                    setField("bullets", [...form.bullets, v]);
                    setField("_newBullet", "");
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Tags
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", mb: 1 }}
              >
                {form.tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    onDelete={() =>
                      setField(
                        "tags",
                        form.tags.filter((x) => x !== t)
                      )
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder='Add tag (e.g. "water", "relax")'
                  value={form._newTag || ""}
                  onChange={(e) => setField("_newTag", e.target.value)}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const v = (form._newTag || "").trim();
                    if (!v || form.tags.includes(v)) return;
                    setField("tags", [...form.tags, v]);
                    setField("_newTag", "");
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>

            {/* Contraindications */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Contraindications
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", mb: 1 }}
              >
                {form.contraindications.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    onDelete={() =>
                      setField(
                        "contraindications",
                        form.contraindications.filter((x) => x !== c)
                      )
                    }
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  select
                  size="small"
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v || form.contraindications.includes(v)) return;
                    setField("contraindications", [
                      ...form.contraindications,
                      v,
                    ]);
                  }}
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="">Add from presets…</MenuItem>
                  {CONTRA_PRESETS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  placeholder="Or type custom"
                  value={form._contraCustom || ""}
                  onChange={(e) => setField("_contraCustom", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    const v = (form._contraCustom || "").trim();
                    if (!v || form.contraindications.includes(v)) return;
                    setField("contraindications", [
                      ...form.contraindications,
                      v,
                    ]);
                    setField("_contraCustom", "");
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Right (media) */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Hero image
            </Typography>
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#f4f4f4",
                aspectRatio: "16/9",
                mb: 1,
              }}
            >
              {form.heroPid ? (
                <img
                  src={cldUrl(form.heroPid)}
                  alt={form.title || "hero"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "text.secondary",
                  }}
                >
                  No hero selected
                </Box>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                startIcon={<AddPhotoAlternateIcon />}
                variant="outlined"
                onClick={() => heroInputRef.current?.click()}
                disabled={saving}
              >
                Upload hero
              </Button>
              {form.heroPid ? (
                <IconButton
                  onClick={() => setField("heroPid", "")}
                  aria-label="remove-hero"
                >
                  <DeleteIcon />
                </IconButton>
              ) : null}
              <TextField
                size="small"
                label="Hero publicId"
                value={form.heroPid}
                onChange={(e) => setField("heroPid", e.target.value)}
                sx={{ ml: "auto" }}
              />
            </Stack>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                await onUploadHero(f);
              }}
              hidden
            />
          </Card>

          <Card sx={{ p: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1">Gallery</Typography>
              <Button
                startIcon={<AddPhotoAlternateIcon />}
                variant="outlined"
                onClick={() => galleryInputRef.current?.click()}
                disabled={saving}
              >
                Add images
              </Button>
            </Stack>

            <Grid container spacing={1}>
              {form.galleryPids.map((pid, idx) => (
                <Grid key={pid || idx} item xs={6}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {pid ? (
                      <img
                        src={cldUrl(pid)}
                        alt={`gallery-${idx}`}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: 120,
                          display: "grid",
                          placeItems: "center",
                          color: "text.secondary",
                          bgcolor: "#f4f4f4",
                        }}
                      >
                        No Preview
                      </Box>
                    )}
                    <IconButton
                      onClick={() =>
                        setField(
                          "galleryPids",
                          form.galleryPids.filter((_, i) => i !== idx)
                        )
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "rgba(255,255,255,0.9)",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = e.target.files;
                e.target.value = "";
                if (!files?.length) return;
                await onUploadGallery(files);
              }}
              hidden
            />
          </Card>
        </Grid>
      </Grid>

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
