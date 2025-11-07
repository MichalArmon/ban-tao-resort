// 📁 src/pages/admin/retreats/AdminRetreatForm.jsx
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import {
  Box,
  Grid,
  Stack,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
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
import { get, post, put } from "../../../config/api";
import { useUpload } from "../../../context/UploadContext";
import { useParams, useNavigate } from "react-router-dom";

/* ---------- Cloudinary ---------- */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const cldUrl = (pid) =>
  pid
    ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${pid}`
    : "";

/* ---------- Component ---------- */
export default function AdminRetreatForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { uploadImage, uploadImages } = useUpload();

  const [form, setForm] = useState({
    name: "",
    category: "",
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().add(6, "days").format("YYYY-MM-DD"),
    price: "",
    currency: "THB",
    capacity: "",
    spotsLeft: "",
    blurb: "",
    description: "",
    featuresCSV: "",
    isPrivate: false,
    isClosed: false,
    published: true,
    heroPid: "",
    galleryPids: [],
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ---------- Load categories ---------- */
  useEffect(() => {
    (async () => {
      try {
        const list = await get("/categories");
        setCategories(list || []);
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    })();
  }, []);

  /* ---------- Load existing retreat ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await get(`/retreats/${id}`);
        if (r) {
          setForm({
            ...form,
            name: r.name || "",
            category: r.category?._id || "",
            startDate: moment(r.startDate).format("YYYY-MM-DD"),
            endDate: moment(r.endDate).format("YYYY-MM-DD"),
            price: r.price || "",
            currency: r.currency || "THB",
            capacity: r.capacity || "",
            spotsLeft: r.spotsLeft || "",
            blurb: r.blurb || "",
            description: r.description || "",
            featuresCSV: (r.features || []).join(", "),
            isPrivate: !!r.isPrivate,
            isClosed: !!r.isClosed,
            published: !!r.published,
            heroPid: r.hero?.publicId || "",
            galleryPids: Array.isArray(r.gallery)
              ? r.gallery.map((g) => g.publicId || "").filter(Boolean)
              : [],
          });
        }
      } catch (e) {
        console.error(e);
        setErr("שגיאה בטעינת הריטריט לעריכה");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- Save ---------- */
  const handleSave = async () => {
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const payload = {
        ...form,
        features: form.featuresCSV
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        hero: form.heroPid
          ? {
              publicId: form.heroPid,
              url: cldUrl(form.heroPid),
              alt: form.name,
            }
          : {},
        gallery: form.galleryPids.map((pid) => ({
          publicId: pid,
          url: cldUrl(pid),
          alt: form.name,
        })),
      };

      const res = id
        ? await put(`/retreats/${id}`, payload)
        : await post("/retreats", payload);

      setOk(id ? "✅ עודכן בהצלחה" : "✅ נוצר בהצלחה");
      setTimeout(() => navigate("/admin/retreats"), 1000);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Upload Hero ---------- */
  const onUploadHero = async (file) => {
    if (!file || !form.name) return;
    setSaving(true);
    try {
      const folder = `ban-tao/retreats/${form.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      const up = await uploadImage(file, folder, "hero_main");
      setField("heroPid", up.public_id);
      setOk("Hero image הועלה ✅");
    } catch (e) {
      setErr(e.message || "שגיאה בהעלאת Hero");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Upload Gallery ---------- */
  const onUploadGallery = async (files) => {
    if (!files?.length || !form.name) return;
    setSaving(true);
    try {
      const folder = `ban-tao/retreats/${form.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      const ups = await uploadImages(files, folder);
      const pids = ups.map((u) => u.public_id).filter(Boolean);
      setField("galleryPids", [...form.galleryPids, ...pids]);
      setOk(`Uploaded ${pids.length} gallery images ✅`);
    } catch (e) {
      setErr(e.message || "שגיאה בהעלאת גלריה");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Stack alignItems="center" py={5}>
        <CircularProgress />
      </Stack>
    );

  /* ---------- UI ---------- */
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
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Button
            startIcon={<ArrowBackRounded />}
            onClick={() => navigate("/admin/retreats")}
            color="inherit"
          >
            חזרה לרשימה
          </Button>
          <Typography variant="h5" fontWeight={700}>
            {id ? "עריכת ריטריט" : "ריטריט חדש"}
          </Typography>
        </Stack>

        {err && <Alert severity="error">{err}</Alert>}
        {ok && <Alert severity="success">{ok}</Alert>}

        <Grid container spacing={4}>
          {/* LEFT SIDE: DETAILS */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <TextField
                label="שם הריטריט"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                fullWidth
              />

              <TextField
                select
                label="קטגוריה"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                fullWidth
              >
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          bgcolor: c.color,
                        }}
                      />
                      <Typography>{c.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Blurb (תיאור קצר)"
                value={form.blurb}
                onChange={(e) => setField("blurb", e.target.value)}
                fullWidth
              />

              <TextField
                label="תיאור מלא"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                multiline
                rows={4}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Capacity (סה״כ משתתפים)"
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setField("capacity", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Spots Left (מקומות פנויים)"
                  type="number"
                  value={form.spotsLeft}
                  onChange={(e) => setField("spotsLeft", e.target.value)}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2}>
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
                  {["THB", "USD", "EUR", "ILS"].map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <TextField
                label="Features (מופרדים בפסיקים)"
                value={form.featuresCSV}
                onChange={(e) => setField("featuresCSV", e.target.value)}
                fullWidth
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPrivate}
                    onChange={(e) => setField("isPrivate", e.target.checked)}
                  />
                }
                label="Private Retreat"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isClosed}
                    onChange={(e) => setField("isClosed", e.target.checked)}
                  />
                }
                label="Closed / Not Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.published}
                    onChange={(e) => setField("published", e.target.checked)}
                  />
                }
                label="Published"
              />

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {id ? "שמור עדכון" : "צור ריטריט"}
              </Button>
            </Stack>
          </Grid>

          {/* RIGHT SIDE: IMAGES */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600}>
              Hero Image
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddPhotoAlternateIcon />}
              onClick={() => heroInputRef.current?.click()}
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
                  mt: 2,
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
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                  onClick={() => setField("heroPid", "")}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Card>
            )}

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
              <Grid container spacing={2} mt={2}>
                {form.galleryPids.map((pid, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 2,
                        "&:hover img": { transform: "scale(1.05)" },
                      }}
                    >
                      <Box
                        component="img"
                        src={cldUrl(pid)}
                        alt={`Gallery ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(255,255,255,0.85)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
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
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
