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
import { useRooms } from "../../../context/RoomContext";
import { useParams, useNavigate } from "react-router-dom";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const CURRENCIES = ["USD", "EUR", "ILS", "THB"];

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

export default function RoomForm() {
  const { id } = useParams(); // ← לפי ID
  const navigate = useNavigate();
  const { rooms, ensureRooms } = useRooms();

  const [form, setForm] = useState({
    _id: "",
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

  // 🌀 מצב טעינה — האם החדר עדיין נטען מהשרת
  const [loadingRoom, setLoadingRoom] = useState(true);

  // ✅ הודעת הצלחה שתוצג אחרי שמירה מוצלחת
  const [ok, setOk] = useState("");

  // ❌ הודעת שגיאה שתוצג אם משהו נכשל (כמו העלאה או שמירה)
  const [err, setErr] = useState("");

  // 💾 האם אנחנו כרגע באמצע שמירה (כדי למנוע לחיצה כפולה ולהראות ספינר)
  const [saving, setSaving] = useState(false);

  // ☁️ מביא את פונקציות ההעלאה (uploadImage / uploadImages) מהקונטקסט של Cloudinary
  const uploadCtx =
    (typeof useUpload === "function" ? useUpload() : null) || {};

  // 🖼️ פונקציה להעלאת תמונה אחת (Hero)
  // אם לא נמצאה פונקציה אמיתית בקונטקסט — תזרוק שגיאה ברורה
  const uploadImage =
    uploadCtx.uploadImage ??
    (async () => {
      throw new Error("Upload not available");
    });

  // 🖼️ פונקציה להעלאת כמה תמונות יחד (גלריה)
  // גם כאן יש פונקציה חלופית שמונעת קריסה אם אין קונטקסט תקין
  const uploadImages =
    uploadCtx.uploadImages ??
    (async () => {
      throw new Error("Upload not available");
    });

  // 🔗 משתנים שמחזיקים הפניות (refs) לשדות הקובץ הנסתרים של ה־Hero ושל הגלריה
  // נשתמש בהם כדי לפתוח את חלון בחירת התמונות בלחיצה על כפתור מעוצב
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // 🧱 פונקציה קטנה לעדכון שדה אחד בתוך ה־form בלי למחוק את כל השדות האחרים
  // לדוגמה: setField("title", "Ocean Room")
  const setField = (key, value) =>
    setForm((prev) => ({
      ...prev, // משאיר את כל השדות הקודמים כמו שהם
      [key]: value, // מעדכן רק את השדה שביקשנו
    }));

  /* ===========================================================
     טוען רשימת חדרים והחדר הנבחר לפי ID
     =========================================================== */
  // 🌀 useEffect ראשון — דואג לטעון את רשימת החדרים מהשרת אם היא עדיין ריקה
  useEffect(() => {
    // אם הרשימה rooms עדיין ריקה (לא נטענה)
    if (!rooms.length) {
      // נקרא לפונקציה מהקונטקסט שתביא את כל החדרים מהשרת
      ensureRooms();
    }
    // React יריץ את הקוד הזה שוב רק אם מספר החדרים ישתנה או אם הפונקציה עצמה תשתנה
  }, [rooms.length, ensureRooms]);

  // 🧱 useEffect שני — ממלא את הנתונים בטופס לפי ה־ID, או פותח טופס חדש
  useEffect(() => {
    // אם יש לנו מזהה ID (כלומר עורכים חדר קיים) וגם כבר יש רשימת חדרים
    if (id && rooms.length > 0) {
      // מחפש את החדר המתאים לפי ה־ID
      const room = rooms.find((r) => r._id === id);

      // אם באמת נמצא חדר כזה
      if (room) {
        // ממלא את כל שדות הטופס עם הנתונים שלו
        setForm({
          ...room, // כל הנתונים המקוריים מהשרת
          // ממיר את המערך של ה־features לטקסט עם פסיקים כדי להציג בשדה הטופס
          featuresCSV: Array.isArray(room.features)
            ? room.features.join(", ")
            : "",
        });
      }

      // מסמן שסיימנו לטעון את החדר (אפשר להציג את הטופס)
      setLoadingRoom(false);
    }
    // אחרת — אם אין מזהה (כלומר יוצרים חדר חדש)
    else if (!id && rooms.length > 0) {
      // גם כאן נסיים את מצב הטעינה ונראה טופס ריק
      setLoadingRoom(false);
    }

    // רשימת המשתנים שכשישתנו — הקוד הזה ירוץ שוב
  }, [id, rooms]);

  /* ===========================================================
     יצירה / עדכון
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
      blurb: form.blurb?.trim() || "",
      features: cleanCSV(form.featuresCSV),
      maxGuests: Number(form.maxGuests) || 0,
      sizeM2: Number(form.sizeM2) || 0,
      bedType: form.bedType?.trim() || "",
      priceBase: Number(form.priceBase) || 0,
      currency: form.currency || "USD",
      hero: form.hero || "",
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
      stock: Number(form.stock) || 0,
      active: !!form.active,
    };
  };

  const handleSave = async () => {
    setErr("");
    setOk("");

    const p = toPayload();
    if (!p.title) return setErr("חסר title");
    if (p.maxGuests <= 0) return setErr("Guests חייב להיות מעל 0");

    setSaving(true);
    try {
      // ✅ הנתיבים החדשים
      const url = id ? `/rooms/${id}` : "/rooms";
      const res = id ? await put(url, p) : await post(url, p);
      console.log("✅ save ok:", res);
      setOk(id ? "✅ עודכן בהצלחה" : "✅ נוצר בהצלחה");
    } catch (e) {
      console.error("❌ save error:", e);
      setErr(e?.response?.data?.message || e.message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  /* ===========================================================
     UI
     =========================================================== */
  if (loadingRoom)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>טוען חדר...</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/admin/rooms")}
        sx={{ mb: 3 }}
      >
        חזרה לרשימה
      </Button>

      <Typography variant="h5" fontWeight={700} mb={2}>
        {id ? "עריכת חדר קיים" : "יצירת חדר חדש"}
      </Typography>

      <Grid container spacing={4}>
        {/* 🩵 עמודת שדות טקסט */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <TextField
              label="Title (שם החדר)"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              fullWidth
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

        {/* 🩵 עמודת תמונות */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            {/* === Hero Image === */}
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
                      const folder = `ban-tao/rooms/${form.slug || "temp"}`;
                      const uploaded = await uploadImage(file, folder, "hero");
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

            {/* === Gallery Images === */}
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
                      const folder = `ban-tao/rooms/${form.slug || "temp"}`;
                      const uploaded = await uploadImages(files, folder);
                      const newImgs = uploaded.map((u) => ({
                        publicId: u.public_id,
                        url: u.secure_url,
                        alt: u.original_filename || "",
                      }));
                      setField("images", [...(form.images || []), ...newImgs]);
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

              {/* Preview Grid */}
              <Grid container spacing={1} mt={1}>
                {form.images?.map((img, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Card
                      sx={{
                        position: "relative",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        component="img"
                        src={img.url}
                        alt={img.alt || `Gallery ${i + 1}`}
                        sx={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
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
                            "images",
                            form.images.filter((_, idx) => idx !== i)
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
          </Stack>
        </Grid>

        {/* 🩵 שמירה */}
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
              {id ? "עדכון חדר" : "יצירת חדר חדש"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
