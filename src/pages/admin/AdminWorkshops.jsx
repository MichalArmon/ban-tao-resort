import React, { useEffect, useMemo, useState } from "react";
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
import { get, post, put } from "../../config/api";
import { useUpload } from "../../context/UploadContext";

// utils
const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalizeImage = (x) => {
  if (!x) return null;
  if (typeof x === "string") return { url: x, publicId: null, alt: "" };
  if (x.secure_url || x.url) {
    return {
      url: x.secure_url || x.url,
      publicId: x.public_id || x.publicId || null,
      alt: x.alt || "",
    };
  }
  if (x.publicId)
    return { url: x.url || null, publicId: x.publicId, alt: x.alt || "" };
  return null;
};

const normalizeGallery = (arr) =>
  Array.isArray(arr) ? arr.map(normalizeImage).filter(Boolean) : [];

const CATEGORIES = [
  { value: "movement", label: "Movement" },
  { value: "meditation", label: "Meditation" },
  { value: "wellness", label: "Wellness" },
  { value: "creativity", label: "Creativity" },
  { value: "other", label: "Other" },
];

const LEVELS = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function WorkshopForm({ mode = "create", slug, onSuccess }) {
  const isEdit = mode === "edit";
  const { uploadImage } = useUpload?.() || {};
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "other",
    instructor: "",
    duration: "60 min",
    level: "all",
    price: "",
    isActive: true,
    description: "",
    bullets: [],
    bulletsInput: "",
    hero: null,
    gallery: [],
  });

  // fetch existing when editing
  useEffect(() => {
    const run = async () => {
      if (!isEdit || !slug) return;
      try {
        setLoading(true);
        const data = await get(`/workshops/${encodeURIComponent(slug)}`);
        setForm((f) => ({
          ...f,
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "other",
          instructor: data.instructor || "",
          duration: data.duration || "60 min",
          level: data.level || "all",
          price: data.price ?? "",
          isActive: typeof data.isActive === "boolean" ? data.isActive : true,
          description: data.description || "",
          bullets: Array.isArray(data.bullets) ? data.bullets : [],
          bulletsInput: "",
          hero: normalizeImage(data.hero),
          gallery: normalizeGallery(data.gallery),
        }));
      } catch (e) {
        console.error("failed to load workshop:", e);
        setAlert({ type: "error", msg: "Failed to load workshop" });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isEdit, slug]);

  // auto-slugify on title change (create mode only if slug empty)
  useEffect(() => {
    if (!isEdit && form.title && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, form.slug, isEdit]);

  const handleChange = (key) => (e) => {
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const addBullet = () => {
    const v = form.bulletsInput?.trim();
    if (!v) return;
    setForm((f) => ({ ...f, bullets: [...f.bullets, v], bulletsInput: "" }));
  };

  const removeBullet = (idx) => {
    setForm((f) => ({ ...f, bullets: f.bullets.filter((_, i) => i !== idx) }));
  };

  const onUploadHero = async () => {
    try {
      if (!uploadImage) return;
      const res = await uploadImage({ folder: "workshops/hero" });
      if (!res) return;
      setForm((f) => ({ ...f, hero: normalizeImage(res) }));
    } catch (e) {
      console.error("upload hero failed", e);
    }
  };

  const onUploadGallery = async () => {
    try {
      if (!uploadImage) return;
      const res = await uploadImage({ folder: "workshops/gallery" });
      if (!res) return;
      setForm((f) => ({ ...f, gallery: [...f.gallery, normalizeImage(res)] }));
    } catch (e) {
      console.error("upload gallery failed", e);
    }
  };

  const removeGalleryItem = (idx) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== idx) }));
  };

  const payload = useMemo(
    () => ({
      title: form.title?.trim(),
      slug: form.slug?.trim(),
      category: form.category,
      instructor: form.instructor?.trim(),
      duration: form.duration?.trim(),
      level: form.level,
      price: form.price === "" ? undefined : Number(form.price),
      isActive: form.isActive,
      description: form.description?.trim(),
      bullets: form.bullets,
      hero: normalizeImage(form.hero),
      gallery: normalizeGallery(form.gallery),
    }),
    [form]
  );

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    setAlert(null);
    if (!payload.title) {
      setAlert({ type: "warning", msg: "Title is required" });
      return;
    }
    try {
      setSaving(true);
      if (isEdit) {
        const res = await put(
          `/workshops/${encodeURIComponent(slug || form.slug)}`,
          payload
        );
        setAlert({ type: "success", msg: `Updated: ${res.title}` });
      } else {
        const res = await post("/workshops", payload);
        setAlert({ type: "success", msg: `Created: ${res.title}` });
        // reset form after create
        setForm((f) => ({
          ...f,
          title: "",
          slug: "",
          instructor: "",
          duration: "60 min",
          level: "all",
          price: "",
          isActive: true,
          description: "",
          bullets: [],
          bulletsInput: "",
          hero: null,
          gallery: [],
        }));
      }
      onSuccess?.();
    } catch (e) {
      console.error("save workshop failed:", e);
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        (isEdit ? "Failed to update workshop" : "Failed to create workshop");
      setAlert({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2} sx={{ pb: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          {isEdit ? "Edit Workshop" : "Create Workshop"}
        </Typography>
        {alert && <Alert severity={alert.type}>{alert.msg}</Alert>}
      </Stack>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <TextField
              label="Title *"
              value={form.title}
              onChange={handleChange("title")}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
              }
              helperText="Auto-generated from title. You can edit."
              fullWidth
              disabled={loading}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  value={form.category}
                  onChange={handleChange("category")}
                  fullWidth
                >
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Level"
                  value={form.level}
                  onChange={handleChange("level")}
                  fullWidth
                >
                  {LEVELS.map((lv) => (
                    <MenuItem key={lv.value} value={lv.value}>
                      {lv.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Instructor"
                  value={form.instructor}
                  onChange={handleChange("instructor")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Duration"
                  value={form.duration}
                  onChange={handleChange("duration")}
                  placeholder="60 min"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Price (optional)"
                  value={form.price}
                  onChange={handleChange("price")}
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                />
              }
              label="Active"
            />

            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange("description")}
              multiline
              minRows={4}
              fullWidth
            />

            {/* bullets */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">Highlights</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Add highlight"
                  value={form.bulletsInput}
                  onChange={handleChange("bulletsInput")}
                  fullWidth
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBullet();
                    }
                  }}
                />
                <Button variant="outlined" onClick={addBullet}>
                  Add
                </Button>
              </Stack>
              <Stack spacing={1}>
                {form.bullets.map((b, i) => (
                  <Stack
                    key={`${b}-${i}`}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={(theme) => ({
                      p: 1,
                      borderRadius: 1,
                      bgcolor: theme.palette.action.hover,
                    })}
                  >
                    <Typography variant="body2">{b}</Typography>
                    <IconButton size="small" onClick={() => removeBullet(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                {form.bullets.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No highlights yet.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        {/* Right column - images */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Hero image</Typography>
            <Card
              variant="outlined"
              sx={{
                p: 1,
                display: "grid",
                placeItems: "center",
                minHeight: 220,
                borderStyle: "dashed",
              }}
            >
              {form.hero?.url ? (
                <Box sx={{ position: "relative", width: "100%" }}>
                  <Box
                    component="img"
                    alt="hero"
                    src={form.hero.url}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    onClick={() => setForm((f) => ({ ...f, hero: null }))}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={onUploadHero}
                >
                  Upload hero
                </Button>
              )}
            </Card>

            <Divider />

            <Typography variant="subtitle2">Gallery</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {form.gallery.map((g, i) => (
                <Card
                  key={`${g?.publicId || g?.url || i}`}
                  variant="outlined"
                  sx={{ p: 0.5, position: "relative", width: 140 }}
                >
                  <Box
                    component="img"
                    src={g.url}
                    alt={g.alt || `img-${i}`}
                    sx={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeGalleryItem(i)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "background.paper",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Card>
              ))}
              <Button
                startIcon={<AddPhotoAlternateIcon />}
                onClick={onUploadGallery}
                sx={{ alignSelf: "flex-start" }}
              >
                Add image
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          type="submit"
          disabled={saving || loading}
        >
          {isEdit ? "Save changes" : "Create workshop"}
        </Button>
      </Stack>
    </Box>
  );
}
