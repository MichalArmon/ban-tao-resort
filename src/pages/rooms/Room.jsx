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
import { pub } from "../../../utils/publicPath";
import useRoomsConfig from "../../hooks/useRoomsConfig";
import { Hotel, SquareFoot, People } from "@mui/icons-material";

const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");
const imgSrc = (p) => (p?.startsWith?.("http") ? p : pub(p));
const FALLBACK_IMG = "https://via.placeholder.com/1600x900?text=Room+Image";

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

  useEffect(() => {
    if (!data) return;
    const nextDefault = data.hero || data.images?.[0] || null;
    setImgLoaded(false);
    setMainImage(nextDefault ? imgSrc(nextDefault) : null);
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

  const images = data.images || [];
  const handleImageChange = (newImgSrc) => {
    const next = imgSrc(newImgSrc);
    if (next === mainImage) return;
    setImgLoaded(false);
    setMainImage(next);
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
      {/* כותרת מיושרת לשמאל */}
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

      {/* תמונה גדולה + גלריה ימנית בגובה זהה */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          height: { xs: 300, md: 520 }, // 🔑 גובה אחיד לשני החלקים
          width: "100%",
        }}
      >
        {/* תמונה ראשית */}
        <Paper
          elevation={0}
          sx={{
            flex: "0 0 80%", // 🔹 80% מהשטח
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

        {/* גלריה ימנית — מעט רחבה יותר (20%) ומתפרסת על כל הגובה */}
        <Stack
          spacing={1.2}
          sx={{
            flex: "0 0 20%",
            height: "100%", // ✅ אותו גובה כמו התמונה
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
          {images.map((img, idx) => {
            const full = imgSrc(img);
            const isActive = full === mainImage;
            return (
              <Box
                key={img}
                component="img"
                src={full}
                alt=""
                onClick={() => handleImageChange(img)}
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

                  // 🔹 גבהים משתנים למראה דינמי
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

      {/* תיאור + נתונים */}
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
