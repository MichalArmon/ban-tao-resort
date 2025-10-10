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

// publicId → Cloudinary URL
// publicId או URL מלא → תמיד מחזיר URL תקין
const cldUrl = (input) => {
  if (!input) return null;
  // אם זה כבר URL מלא (מתחיל ב-http), נחזיר כמו שהוא
  if (typeof input === "string" && input.startsWith("http")) return input;

  // אחרת נבנה URL מ-publicId בלבד
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${input}`;
};

// מחזיר URL hero תקין מכל פורמט
const pickHeroUrl = (data) =>
  data?.heroUrl ||
  data?.hero?.url ||
  (typeof data?.hero === "string" ? cldUrl(data.hero) : null) ||
  data?.imageUrls?.[0] ||
  data?.images?.[0]?.url ||
  (typeof data?.images?.[0] === "string" ? cldUrl(data.images[0]) : null) ||
  null;

// מנרמל מערך תמונות ל־URL-ים
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

export default function Room() {
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

  const [mainImage, setMainImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  console.log("ROOM DATA:", data);

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
  if (error || !data)
    return <Navigate to="/resort/guest/rooms/bungalow" replace />;

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

  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 6, md: 10 } }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mb: { xs: 3, md: 4 },
          fontWeight: 700,
          textAlign: "left",
          color: "primary.main",
          fontSize: { xs: 28, md: 44 },
        }}
      >
        {data.title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          height: { xs: 300, md: 520 },
          width: "100%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: "0 0 80%",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
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
                height: "100%",
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
        </Paper>

        <Stack
          spacing={1.2}
          sx={{
            flex: "0 0 20%",
            height: "100%",
            overflowY: "auto",
            borderRadius: 2,
            pr: 0.5,
            "&::-webkit-scrollbar": { width: 6 },
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
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: 1,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: isActive ? "primary.light" : "transparent",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                  "&:hover": { transform: "scale(1.03)" },
                  maxHeight:
                    idx % 3 === 0
                      ? { xs: 140, md: 200 }
                      : idx % 3 === 1
                      ? { xs: 110, md: 160 }
                      : { xs: 90, md: 130 },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ my: { xs: 3, md: 5 } }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Room Description
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, whiteSpace: "pre-line" }}>
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

          <Button
            variant="contained"
            size="large"
            sx={{ textTransform: "none" }}
            href="https://wa.me/972502136623"
            target="_blank"
          >
            Check availability
          </Button>
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
              variant="h5"
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
