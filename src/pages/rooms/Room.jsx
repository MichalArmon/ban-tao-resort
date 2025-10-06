import { useMemo, useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import { pub } from "../../../utils/publicPath";
import useRoomsConfig from "../../hooks/useRoomsConfig";
import { Hotel, SquareFoot, People } from "@mui/icons-material";

// פונקציות עזר נשארות כפי שהן
const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");
const imgSrc = (p) => (p?.startsWith("http") ? p : pub(p));

export default function Room() {
  // =======================================================
  // ✅ 1. כל הקריאות ל-Hooks חייבות להיות כאן, למעלה
  // =======================================================
  const { type } = useParams();
  const roomSlug = (type || "").toLowerCase();
  const { rooms, loading, error } = useRoomsConfig();

  const data = useMemo(() => {
    if (!rooms || Object.keys(rooms).length === 0) return null;
    const foundKey = Object.keys(rooms).find(
      (key) => slugify(key) === roomSlug
    );
    return foundKey ? rooms[foundKey] : null;
  }, [rooms, roomSlug]);

  // משתנה עזר כדי לחשב את התמונה ההתחלתית
  const initialImage = data ? data.hero || data.images?.[0] : null;

  // ✅ 2. ה-useState חייב להיות כאן
  const [mainImage, setMainImage] = useState(initialImage);

  // ✅ 3. ה-useEffect חייב להיות כאן
  useEffect(() => {
    // אם הנתונים טרם נטענו או שה-roomSlug ריק, יוצאים מה-Effect
    if (!data || !roomSlug) return;

    const currentDefault = data.hero || data.images?.[0];

    // מעדכן את ה-mainImage רק אם הוא השתנה או אם החדר התחלף
    if (mainImage !== currentDefault) {
      setMainImage(currentDefault);
    }
  }, [data, roomSlug]);

  // =======================================================
  // ✅ 4. לוגיקת return מותנית - חייבת להיות אחרי ה-Hooks
  // =======================================================

  if (loading) return null;

  if (error || !data) {
    return <Navigate to="/resort/guest/rooms/bungalow" replace />;
  }

  // פונקציה לטיפול באירועי העכבר (לא Hook, אז יכול להיות מוגדר כאן)
  const handleImageChange = (newImgSrc) => {
    setMainImage(newImgSrc);
  };

  const images = data.images || [];

  // ... (facilities נשאר כפי שהיה)
  const facilities = [
    {
      label: `${data.maxGuests ?? 2} guests`,
      icon: <People sx={{ fontSize: 16 }} />,
      value: data.maxGuests,
    },
    {
      label: `${data.sizeM2 ?? 30} m²`,
      icon: <SquareFoot sx={{ fontSize: 16 }} />,
      value: data.sizeM2,
    },
    {
      label: data.bedType ?? "King size",
      icon: <Hotel sx={{ fontSize: 16 }} />,
    },
  ].filter(
    (f) =>
      f.value !== undefined ||
      f.label.includes("guest") ||
      f.label.includes("size")
  );

  return (
    <>
      {/* ... (שאר הקוד של הרינדור נשאר זהה) */}
      {/* Hero Section */}
      {mainImage && (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 350, md: 600 },
            mb: 4,
          }}
        >
          {/* התמונה עצמה */}
          <Box
            component="img"
            src={imgSrc(mainImage)}
            alt={data.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* כותרת החדר (Title) */}
          <Typography
            variant="h2"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontWeight: 700,
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
              textAlign: "center",
              fontSize: { xs: 36, md: 60 },
            }}
          >
            {data.title}
          </Typography>
        </Box>
      )}
                 {" "}
      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 10 } }}>
                {/* 1. גלריית תמונות קטנות אינטראקטיבית */}       {" "}
        <Grid container spacing={2} sx={{ mb: 6 }}>
                   {" "}
          {images.map((img) => (
            <Grid key={img} item xs={4} sm={3}>
                           {" "}
              <Box
                component="img"
                src={imgSrc(img)}
                alt={`${data.title} photo`}
                // ✅ הוספת אינטראקציה
                onMouseEnter={() => handleImageChange(img)}
                onClick={() => handleImageChange(img)}
                sx={{
                  width: "100%",
                  height: { xs: 80, md: 120 },
                  objectFit: "cover",
                  borderRadius: 1,
                  cursor: "pointer",
                  opacity: imgSrc(img) === imgSrc(mainImage) ? 1 : 0.6,
                  border:
                    imgSrc(img) === imgSrc(mainImage) ? "2px solid" : "none",
                  borderColor: "primary.main",
                  transition: "opacity 0.2s",
                }}
              />
                         {" "}
            </Grid>
          ))}
                 {" "}
        </Grid>
                        <Divider sx={{ my: 4 }} />               {" "}
        {/* 2. בלוק טקסט ומתקנים */}       {" "}
        <Grid container spacing={4} alignItems="flex-start">
                    {/* טור שמאל: טקסט ותכונות נוספות */}         {" "}
          <Grid item xs={12} md={7}>
                       {" "}
            <Typography variant="body1" sx={{ mb: 4, whiteSpace: "pre-line" }}>
              {data.blurb}
            </Typography>
                                   {" "}
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Room Amenities
            </Typography>
                       {" "}
            {!!data.features?.length && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 3 }}
              >
                               {" "}
                {data.features.map((f) => (
                  <Chip key={f} label={f} variant="outlined" size="small" />
                ))}
                             {" "}
              </Stack>
            )}
                                   {" "}
            <Button
              variant="contained"
              size="large"
              sx={{ textTransform: "none" }}
              href="https://wa.me/972502136623"
              target="_blank"
              rel="noopener"
            >
                            Check availability            {" "}
            </Button>
                     {" "}
          </Grid>
                              {/* טור ימין: מתקנים (Facilities) */}         {" "}
          <Grid item xs={12} md={5}>
                       {" "}
            <Box
              sx={{
                p: 3,
                borderLeft: { md: "1px solid" },
                borderColor: "divider",
              }}
            >
                             {" "}
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                    Facilities                {" "}
              </Typography>
                             {" "}
              <Stack spacing={1}>
                                   {" "}
                {facilities.map((f, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                                               {" "}
                    <Box color="primary.main" sx={{ display: "flex" }}>
                      {f.icon}
                    </Box>
                                               {" "}
                    <Typography variant="body1">{f.label}</Typography>         
                                 {" "}
                  </Stack>
                ))}
                               {" "}
              </Stack>
                         {" "}
            </Box>
                     {" "}
          </Grid>
                 {" "}
        </Grid>
             {" "}
      </Container>
    </>
  );
}
