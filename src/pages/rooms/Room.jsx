// src/pages/rooms/Room.jsx
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
  Paper,
} from "@mui/material";
import useRoomsConfig from "../../hooks/useRoomsConfig";
import { Hotel, SquareFoot, People } from "@mui/icons-material";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dhje7hbxd";
const FALLBACK_IMG = "https://via.placeholder.com/1600x900?text=Room+Image";
const slugify = (text = "") => text.toLowerCase().replace(/\s+/g, "-");

const cldUrl = (input) => {
  if (!input) return null;
  if (typeof input === "string" && input.startsWith("http")) return input;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${input}`;
};

const pickHeroUrl = (data) =>
  data?.heroUrl ||
  data?.hero?.url ||
  (typeof data?.hero === "string" ? cldUrl(data.hero) : null) ||
  data?.imageUrls?.[0] ||
  data?.images?.[0]?.url ||
  (typeof data?.images?.[0] === "string" ? cldUrl(data.images[0]) : null) ||
  null;

const normalizeImageUrls = (data) => {
  const raw = Array.isArray(data?.imageUrls)
    ? data.imageUrls
    : Array.isArray(data?.images)
    ? data.images
    : [];
  return raw
    .map((x) => (typeof x === "string" ? cldUrl(x) : x?.url || null))
    .filter(Boolean);
};

export default function Room({ slug: propSlug, embedded = false }) {
  const params = useParams();
  const roomSlug = (propSlug || params.type || "").toLowerCase();
  const { rooms, loading, error } = useRoomsConfig();

  const data = useMemo(() => {
    if (!rooms) return null;
    const keys = Object.keys(rooms);
    if (!keys.length) return null;

    let found = null;
    for (const key of keys) {
      const r = rooms[key];
      if (r?.slug && r.slug.toLowerCase() === roomSlug) {
        found = r;
        break;
      }
    }
    if (!found) {
      for (const key of keys) {
        if (slugify(key) === roomSlug) {
          found = rooms[key];
          break;
        }
      }
    }
    return found;
  }, [rooms, roomSlug]);

  const [mainImage, setMainImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!data) return;
    const hero = pickHeroUrl(data);
    const gallery = normalizeImageUrls(data);
    const nextDefault = hero || gallery[0] || null;
    setImgLoaded(false);
    setMainImage(nextDefault);
  }, [data, roomSlug]);

  useEffect(() => {
    if (!mainImage) return;
    const img = new Image();
    img.onload = () => setImgLoaded(true);
    img.onerror = () => {
      setMainImage(FALLBACK_IMG);
      setImgLoaded(true);
    };
    img.src = mainImage;
  }, [mainImage]);

  if (loading) return null;
  if ((error || !data) && !embedded)
    return <Navigate to="/resort/guest/rooms/bungalow" replace />;
  if ((error || !data) && embedded) return null;

  const images = normalizeImageUrls(data);
  const handleImageChange = (newImgSrc) => {
    if (!newImgSrc || newImgSrc === mainImage) return;
    setImgLoaded(false);
    setMainImage(newImgSrc);
  };

  const facilities = [
    {
      label: `${data.maxGuests ?? 2} guests`,
      icon: <People sx={{ fontSize: 16 }} />,
    },
    {
      label: `${data.sizeM2 ?? 30} m²`,
      icon: <SquareFoot sx={{ fontSize: 16 }} />,
    },
    {
      label: data.bedType ?? "King size",
      icon: <Hotel sx={{ fontSize: 16 }} />,
    },
  ];

  // טיפוגרפיה/ריווח
  const titleVariant = embedded ? "h4" : "h3";
  const titleSize = embedded ? { xs: 24, md: 36 } : { xs: 28, md: 44 };

  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 8 } }}
    >
      <Typography
        variant={titleVariant}
        component="h1"
        sx={{
          mb: { xs: 2, md: 3 },
          fontWeight: 700,
          textAlign: "left",
          color: "primary.main",
          fontSize: titleSize,
        }}
      >
        {data.title}
      </Typography>

      {/* ===== Hero + Gallery =====
          מובייל: טור (hero למעלה, גלריה מתחת)
          דסקטופ: שורה (hero משמאל, גלריה צידית מימין)
      */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ width: "100%" }}
      >
        {/* Hero */}
        <Paper
          elevation={0}
          sx={{
            flex: { md: "0 0 80%" },
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {mainImage && (
            <Box
              component="img"
              src={mainImage}
              alt={data.title}
              onError={() => setMainImage(FALLBACK_IMG)}
              sx={{
                width: "100%",
                // במובייל יחס 16:9; בדסקטופ גובה גבוה יותר
                height: { xs: "56vw", sm: "50vw", md: 520 },
                maxHeight: { xs: 420, md: 520 },
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
                display: "block",
              }}
            />
          )}
        </Paper>

        {/* Gallery */}
        <Box
          sx={{
            // מובייל: שורת תמונות מתחת ל-hero (גלילה אופקית)
            display: { xs: "flex", md: "block" },
            flexDirection: "row",
            gap: 1.2,
            overflowX: { xs: "auto", md: "visible" },
            overflowY: { xs: "hidden", md: "auto" },
            p: { xs: 0.5, md: 0 },
            flex: { md: "0 0 20%" },
            maxHeight: { md: 520 },
            borderRadius: 2,
            pr: { md: 0.5 },
            "&::-webkit-scrollbar": { height: 6, width: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "divider",
              borderRadius: 8,
            },
          }}
        >
          {images.map((full, idx) => {
            const isActive = full === mainImage;
            return (
              <Box
                key={full + idx}
                component="img"
                src={full}
                alt=""
                onClick={() => handleImageChange(full)}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 1.2,
                  border: "2px solid",
                  borderColor: isActive ? "primary.light" : "transparent",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  "&:hover": { transform: "scale(1.03)" },
                  // מובייל: ממדים קטנים לרוחב; דסקטופ: אריחים אנכיים
                  width: { xs: 120, sm: 140, md: "100%" },
                  height: { xs: 80, sm: 100, md: "auto" },
                  objectFit: "cover",
                  flex: { xs: "0 0 auto", md: "unset" },
                  mb: { md: 1.2 },
                }}
              />
            );
          })}
        </Box>
      </Stack>

      <Divider sx={{ my: { xs: 3, md: 4 } }} />

      {/* ===== Content blocks stacked ===== */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            Room Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-line" }}>
            {data.blurb}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
            Room Amenities
          </Typography>
          {!!data.features?.length && (
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 3 }}
            >
              {data.features.map((f) => (
                <Chip key={f} label={f} variant="outlined" size="medium" />
              ))}
            </Stack>
          )}

          {!embedded && (
            <Button
              variant="contained"
              size="large"
              sx={{ textTransform: "none" }}
              href="https://wa.me/972502136623"
              target="_blank"
            >
              Check availability
            </Button>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}
            >
              Room Quick Facts
            </Typography>
            <Stack spacing={1.5}>
              {facilities.map((f, i) => (
                <Stack
                  key={i}
                  direction="row"
                  alignItems="center"
                  spacing={1.2}
                >
                  <Box color="primary.main">{f.icon}</Box>
                  <Typography variant="body1">{f.label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
