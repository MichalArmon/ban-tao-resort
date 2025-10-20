// 📁 src/pages/classes/ClassesLanding.jsx
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useWorkshops } from "../../context/WorkshopsContext";

/* ==========
   Hero
   ========== */
function ClassesHero() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        left: "50%",
        right: "50%",
        ml: "-50vw",
        mr: "-50vw",
        height: { xs: "70vh", md: "68vh" },
        overflow: "hidden",
        mb: { xs: 4, md: 6 },
      }}
    >
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1651077837628-52b3247550ae?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974"
        alt="Classes hero"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.05) saturate(1.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.45) 100%)",
        }}
      />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Stack
          spacing={3}
          sx={{ color: "#fff", maxWidth: { xs: "100%", md: "70%" } }}
        >
          <Typography
            variant="overline"
            sx={{ letterSpacing: 2, opacity: 0.9 }}
          >
            Ban Tao Village &gt; Workshops
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            Discover Our Workshops
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95 }}>
            Move, breathe, arrive. Explore daily sessions designed to balance
            energy and restore calm—on and off the mat.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" size="large">
              See Schedule
            </Button>
            <Button variant="outlined" size="large" color="inherit">
              Contact Us
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

/* ==========
   Alternating section (שומר על אותו עיצוב)
   ========== */
function ClassSection({ item, reverse = false }) {
  const imgSrc =
    item?.hero?.url ||
    item?.gallery?.[0]?.url ||
    "https://via.placeholder.com/1200x800?text=Workshop";

  const levelLabel = (item?.level || "all")
    .toString()
    .replace(/^./, (c) => c.toUpperCase());
  const durationLabel = item?.duration || "60–90 min";
  const bullets = Array.isArray(item?.bullets) ? item.bullets : [];
  const blurb = item?.description || item?.blurb || "";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Grid
        container
        spacing={4}
        direction={reverse ? "row-reverse" : "row"}
        alignItems="center"
        sx={{
          flexWrap: "nowrap",
          "@media (max-width:900px)": { flexWrap: "wrap" }, // מאפשר שבירה במסכים קטנים
        }}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={imgSrc}
            alt={item?.title || "Workshop"}
            loading="lazy"
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              borderRadius: 3,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2} sx={{ maxWidth: 500, mx: "auto" }}>
            <Stack direction="row" spacing={1}>
              <Chip label={`${levelLabel} level`} size="small" />
              <Chip label={durationLabel} size="small" />
              {item?.category && <Chip label={item.category} size="small" />}
            </Stack>

            <Typography variant="h4" fontWeight={800}>
              {item?.title || "Workshop"}
            </Typography>

            {blurb && (
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {blurb}
              </Typography>
            )}

            {bullets.length > 0 && (
              <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
                {bullets.map((b, i) => (
                  <Typography key={i} component="li" variant="body2">
                    {b}
                  </Typography>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button variant="contained">View Class</Button>
              <Button variant="text">Learn More</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

/* ==========
   Page
   ========== */
export default function ClassesLanding() {
  const { items, loading, error } = useWorkshops(); // נטען מהשרת דרך הקונטקסט

  return (
    <Box sx={{ pb: { xs: 6, md: 10 } }}>
      <ClassesHero />

      {loading && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading workshops…
            </Typography>
          </Stack>
        </Container>
      )}

      {error && (
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert severity="error">{String(error)}</Alert>
        </Container>
      )}

      {!loading && !error && items?.length === 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            No workshops available yet.
          </Typography>
        </Container>
      )}

      {!loading &&
        !error &&
        items?.map((c, idx) => (
          <ClassSection
            key={c._id || c.slug || idx}
            item={c}
            reverse={idx % 2 === 1}
          />
        ))}
    </Box>
  );
}
