import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
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
import { post, put, get } from "../../../config/api";
import { useUpload } from "../../../context/UploadContext";
import { useParams, useNavigate } from "react-router-dom";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const cldUrl = (publicId) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;

export default function AdminRetreatForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const uploadCtx = useUpload();
  const uploadImage = uploadCtx?.uploadImage;
  const uploadImages = uploadCtx?.uploadImages;

  const [form, setForm] = useState({
    name: "",
    category: "",
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().add(6, "days").format("YYYY-MM-DD"),
    color: "#66bb6a",
    price: 2200,
    capacity: 0,
    spotsLeft: 0,
    isPrivate: false,
    isClosed: false,
    published: true,
    hero: "",
    gallery: [],
    blurb: "",
    description: "",
    featuresCSV: "Daily yoga, Meditation, Sauna access",
  });

  const [categories, setCategories] = useState([]);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ---------- Load categories ---------- */
  useEffect(() => {
    (async () => {
      const list = await get("/categories");
      setCategories(list);
    })();
  }, []);

  /* ---------- Load existing retreat if editing ---------- */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await get(`/retreats/${id}`);
        if (r) {
          setForm({
            ...r,
            startDate: moment(r.startDate).format("YYYY-MM-DD"),
            endDate: moment(r.endDate).format("YYYY-MM-DD"),
            featuresCSV: (r.features || []).join(", "),
          });
        }
      } catch (e) {
        setErr("שגיאה בטעינת ריטריט לעריכה");
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
      const id = await uploadImage(file, folder, "hero_main");
      setField("hero", id);
      setOk("Hero image הועלה ✅");
    } catch (err) {
      setErr(err.message || "שגיאה בהעלאת Hero");
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        variant="outlined"
        sx={{ mb: 3 }}
        onClick={() => navigate("/admin/retreats")}
      >
        ← חזרה לרשימה
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField
              label="שם הריטריט"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />

            <TextField
              select
              label="קטגוריה"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
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
              />
              <TextField
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
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

            {err && <Alert severity="error">{err}</Alert>}
            {ok && <Alert severity="success">{ok}</Alert>}

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={<SaveIcon />}
            >
              {id ? "שמור עדכון" : "צור ריטריט"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
