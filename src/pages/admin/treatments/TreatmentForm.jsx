// 📁 src/pages/admin/treatments/TreatmentForm.jsx
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
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { useTreatments } from "../../../context/TreatmentsContext";
import { useUpload } from "../../../context/UploadContext";
import { useParams, useNavigate } from "react-router-dom";

/* ---------- Cloudinary helper ---------- */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const cldUrl = (publicId) =>
  publicId
    ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`
    : "";

/* ---------- Constants ---------- */
const INTENSITY_OPTS = [
  { value: "gentle", label: "Gentle" },
  { value: "moderate", label: "Moderate" },
  { value: "deep", label: "Deep" },
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

const CURRENCY_PRESETS = ["THB", "USD", "EUR", "ILS"];

/* ---------- Slugify helper ---------- */
const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function TreatmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { createTreatment, updateTreatment, getTreatment } = useTreatments();
  const uploadCtx = useUpload();
  const uploadImage = uploadCtx.uploadImage;
  const uploadImages = uploadCtx.uploadImages;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    therapist: "",
    durationMinutes: 60,
    price: "",
    currency: "THB",
    isActive: true,
    isPrivate: false,
    isClosed: false,
    description: "",
    intensity: "gentle",
    contraindications: [],
    heroPid: "",
    galleryPids: [],
  });

  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const nameSlug = useMemo(() => slugify(form.title || ""), [form.title]);

  /* ---------- Load existing treatment ---------- */
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getTreatment(id);
        if (!data) throw new Error("Not found");
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "",
          therapist: data.therapist || "",
          durationMinutes: data.durationMinutes || 60,
          price: data.price ?? "",
          currency: data.currency || "THB",
          isActive: !!data.isActive,
          isPrivate: !!data.isPrivate,
          isClosed: !!data.isClosed,
          description: data.description || "",
          intensity: data.intensity || "gentle",
          contraindications: Array.isArray(data.contraindications)
            ? data.contraindications
            : [],
          heroPid: data.hero?.publicId || "",
          galleryPids: Array.isArray(data.gallery)
            ? data.gallery.map((g) => g.publicId || "").filter(Boolean)
            : [],
        });
      } catch (e) {
        setErr(e.message || "Failed to load treatment");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getTreatment]);

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
      price: form.price === "" ? undefined : Number(form.price),
      currency: form.currency || "THB",
      isActive: !!form.isActive,
      isPrivate: !!form.isPrivate,
      isClosed: !!form.isClosed,
      description: (form.description || "").trim(),
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
      if (id) await updateTreatment(id, payload);
      else await createTreatment(payload);
      setOk(id ? "✅ Treatment updated" : "✅ Treatment created");
      navigate("/admin/treatments");
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

  /* ---------- Loading ---------- */
  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading treatment...</Typography>
      </Box>
    );

  /* ---------- UI ---------- */
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin/treatments")}
        >
          Back to list
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {id ? "Edit Treatment" : "New Treatment"}
        </Typography>
        <Box width={120} /> {/* spacer */}
      </Stack>

      {err && <Alert severity="error">{err}</Alert>}
      {ok && <Alert severity="success">{ok}</Alert>}

      <Grid container spacing={4}>
        {/* Left side — form fields */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Category"
              select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
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
            <TextField
              label="Duration (minutes)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) => setField("durationMinutes", e.target.value)}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              fullWidth
            />
            <TextField
              label="Currency"
              select
              value={form.currency}
              onChange={(e) => setField("currency", e.target.value)}
              fullWidth
            >
              {CURRENCY_PRESETS.map((cur) => (
                <MenuItem key={cur} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Intensity"
              select
              value={form.intensity}
              onChange={(e) => setField("intensity", e.target.value)}
              fullWidth
            >
              {INTENSITY_OPTS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Contraindications (comma separated)"
              value={form.contraindications.join(", ")}
              onChange={(e) =>
                setField(
                  "contraindications",
                  e.target.value.split(",").map((x) => x.trim())
                )
              }
              fullWidth
            />
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
              label="Private (by request only)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isClosed}
                  onChange={(e) => setField("isClosed", e.target.checked)}
                />
              }
              label="Temporarily Closed"
            />
          </Stack>
        </Grid>

        {/* Right side — images */}
        <Grid item xs={12} md={6}>
          {/* Hero */}
          <Typography variant="subtitle1" fontWeight={600}>
            Hero Image
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => heroInputRef.current?.click()}
            sx={{ mb: 1 }}
          >
            {form.heroPid ? "Replace Hero" : "Upload Hero"}
          </Button>
          <input
            ref={heroInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onUploadHero(e.target.files?.[0])}
          />

          {form.heroPid && (
            <Card
              sx={{
                width: "100%",
                maxWidth: 500,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: 3,
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={cldUrl(form.heroPid)}
                alt="Hero preview"
                sx={{
                  width: "100%",
                  height: 280,
                  objectFit: "cover",
                }}
              />
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(255,255,255,0.85)",
                }}
                onClick={() => setField("heroPid", "")}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Card>
          )}

          {/* Gallery */}
          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight={600}>
              Gallery Images
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => galleryInputRef.current?.click()}
            >
              Add Gallery Images
            </Button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onUploadGallery(e.target.files)}
            />

            <Grid container spacing={2} mt={1}>
              {form.galleryPids.map((pid, i) => (
                <Grid item xs={6} sm={4} md={4} key={i}>
                  <Card
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={cldUrl(pid)}
                      alt={`Gallery ${i + 1}`}
                      sx={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "rgba(255,255,255,0.8)",
                      }}
                      onClick={() =>
                        setField(
                          "galleryPids",
                          form.galleryPids.filter((_, idx) => idx !== i)
                        )
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}

              {form.galleryPids.length === 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No gallery images yet. Upload to preview them here.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      {/* Save button */}
      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
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
