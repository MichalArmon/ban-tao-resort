// 📁 src/pages/admin/WorkshopForm.jsx
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
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { post, put } from "../../../config/api";
import { useUpload } from "../../../context/UploadContext";
import { useWorkshops } from "../../../context/WorkshopsContext";
import { useParams, useNavigate } from "react-router-dom";

const slugify = (s = "") =>
  s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function WorkshopForm() {
  const { id } = useParams(); // ← לפי ID, לא slug
  const navigate = useNavigate();
  const { items, listWorkshops } = useWorkshops();

  const [form, setForm] = useState({
    _id: "",
    title: "",
    slug: "",
    instructor: "",
    duration: "60 min",
    level: "all",
    description: "",
    price: "",
    isActive: true,
    category: "other",
    categoryId: "",
    bulletsCSV: "",
    hero: null,
    gallery: [],
  });

  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const uploadCtx =
    (typeof useUpload === "function" ? useUpload() : null) || {};
  const uploadImage =
    uploadCtx.uploadImage ?? (async () => new Error("Upload not available"));
  const uploadImages =
    uploadCtx.uploadImages ?? (async () => new Error("Upload not available"));

  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const setField = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  /* ===========================================================
     טוען את רשימת הסדנאות ואת הסדנה הנבחרת לפי ID
     =========================================================== */
  useEffect(() => {
    const load = async () => {
      if (!items.length) await listWorkshops({ sort: "title", limit: 200 });
      setLoading(false);
    };
    load();
  }, [items.length, listWorkshops]);

  useEffect(() => {
    if (id && items.length > 0) {
      const ws = items.find((w) => w._id === id);
      if (ws) {
        setForm({
          ...ws,
          bulletsCSV: Array.isArray(ws.bullets) ? ws.bullets.join(", ") : "",
        });
      }
      setLoading(false);
    } else if (!id && items.length > 0) {
      setLoading(false); // מצב יצירה
    }
  }, [id, items]);

  /* ===========================================================
     הכנה לשמירה
     =========================================================== */
  const toPayload = () => {
    const cleanCSV = (s = "") =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    return {
      title: form.title?.trim(),
      slug: slugify(form.title),
      instructor: form.instructor?.trim(),
      duration: form.duration?.trim(),
      level: form.level,
      description: form.description?.trim(),
      price: Number(form.price) || undefined,
      isActive: !!form.isActive,
      category: form.category,
      categoryId: form.categoryId || undefined,
      bullets: cleanCSV(form.bulletsCSV),
      hero: form.hero,
      gallery: Array.isArray(form.gallery) ? form.gallery.filter(Boolean) : [],
    };
  };

  /* ===========================================================
     שמירה לשרת
     =========================================================== */
  const handleSave = async () => {
    setErr("");
    setOk("");
    const p = toPayload();

    if (!p.title) return setErr("חסר title");

    setSaving(true);
    try {
      const url = id ? `/workshops/id/${id}` : "/workshops";
      const res = id ? await put(url, p) : await post(url, p);
      console.log("✅ saved workshop:", res);
      setOk(id ? "✅ עודכן בהצלחה" : "✅ נוצר בהצלחה");
    } catch (e) {
      console.error("❌ save error:", e);
      setErr(e?.response?.data?.error || e.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  /* ===========================================================
     UI
     =========================================================== */
  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>טוען סדנה...</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        bgcolor: "background.default",
        py: { xs: 3, md: 6 },
        px: { xs: 2, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin/workshops")}
          sx={{ mb: 3 }}
        >
          חזרה לרשימה
        </Button>

        <Typography variant="h5" fontWeight={700} mb={2}>
          {id ? "עריכת סדנה קיימת" : "יצירת סדנה חדשה"}
        </Typography>

        <Grid container spacing={4} maxWidth="xl">
          {/* ===== עמודת שדות ===== */}
          <Grid item xs={12} md={6} sx={{ width: 800 }}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                fullWidth
              />
              <TextField
                label="Instructor"
                value={form.instructor}
                onChange={(e) => setField("instructor", e.target.value)}
                fullWidth
              />
              <TextField
                label="Duration"
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                fullWidth
              />
              <TextField
                label="Level"
                value={form.level}
                onChange={(e) => setField("level", e.target.value)}
                select
                fullWidth
              >
                {["all", "beginner", "intermediate", "advanced"].map((lv) => (
                  <MenuItem key={lv} value={lv}>
                    {lv}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
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
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              <TextField
                label="Highlights (CSV)"
                value={form.bulletsCSV}
                onChange={(e) => setField("bulletsCSV", e.target.value)}
                fullWidth
                placeholder="e.g. Relaxation, Breathing"
              />
            </Stack>
          </Grid>

          {/* ===== עמודת תמונות ===== */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Hero */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Hero Image
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={() => heroInputRef.current?.click()}
                  >
                    העלאת HERO
                  </Button>
                  <input
                    ref={heroInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSaving(true);
                      try {
                        const folder = `ban-tao/workshops/${
                          form.slug || "temp"
                        }`;
                        const uploaded = await uploadImage(
                          file,
                          folder,
                          "hero"
                        );
                        setField("hero", {
                          publicId: uploaded.public_id,
                          url: uploaded.secure_url,
                          alt: uploaded.original_filename || "",
                        });
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

                {form.hero?.url && (
                  <Box
                    component="img"
                    src={form.hero.url}
                    alt={form.hero.alt || "Hero Preview"}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      mt: 1,
                    }}
                  />
                )}
              </Box>

              {/* Gallery */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Gallery Images
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    העלאת תמונות לגלריה
                  </Button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setSaving(true);
                      try {
                        const folder = `ban-tao/workshops/${
                          form.slug || "temp"
                        }`;
                        const uploaded = await uploadImages(files, folder);
                        const newImgs = uploaded.map((u) => ({
                          publicId: u.public_id,
                          url: u.secure_url,
                          alt: u.original_filename || "",
                        }));
                        setField("gallery", [
                          ...(form.gallery || []),
                          ...newImgs,
                        ]);
                        setOk(`${uploaded.length} תמונות נוספו ✅`);
                      } catch (err) {
                        setErr(err.message || "שגיאה בהעלאת גלריה");
                      } finally {
                        setSaving(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </Stack>
                <Grid container spacing={1} mt={1}>
                  {form.gallery?.map((img, i) => {
                    // ✨ נוודא שתמיד יש URL תקין
                    const src =
                      img.url ||
                      img.secure_url ||
                      (img.publicId
                        ? `https://res.cloudinary.com/dhje7hbxd/image/upload/f_auto,q_auto/${img.publicId}`
                        : null);

                    return (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        <Card
                          sx={{
                            position: "relative",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {src ? (
                            <Box
                              component="img"
                              src={src}
                              alt={img.alt || `Gallery ${i + 1}`}
                              sx={{
                                width: "100%",
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: "100%",
                                height: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "grey.100",
                                color: "text.secondary",
                                fontSize: 12,
                              }}
                            >
                              אין תצוגה מקדימה
                            </Box>
                          )}

                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(255,255,255,0.8)",
                            }}
                            onClick={() =>
                              setField(
                                "gallery",
                                form.gallery.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Stack>
          </Grid>

          {/* ===== שמירה ===== */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              {err && <Alert severity="error">{err}</Alert>}
              {ok && <Alert severity="success">{ok}</Alert>}
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {id ? "עדכון סדנה" : "יצירת סדנה חדשה"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
