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
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import TreatmentSchedule from "../../components/treatments/TreatmentSchedule";
import { useTreatmentSessions } from "../../context/TreatmentSessionsContext";
import { useTreatments } from "../../context/TreatmentsContext";

/* ---------------------------------------------------------
   HERO
--------------------------------------------------------- */
function TreatmentsHero() {
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
        src="https://images.unsplash.com/photo-1483137140003-ae073b395549?auto=format&fit=crop&q=80&w=1170"
        alt="Treatments hero"
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
            Ban Tao Village &gt; Treatments
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            Discover Our Treatments
          </Typography>

          <Typography variant="h6" sx={{ opacity: 0.95 }}>
            Hands-on care to release tension, restore balance, and soften the
            body–mind.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" size="large">
              Book a Session
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

/* ---------------------------------------------------------
   TREATMENT SECTION
--------------------------------------------------------- */
function TreatmentSection({ item, reverse = false, onOpenSchedule }) {
  const imgSrc =
    item?.hero?.url ||
    item?.gallery?.[0]?.url ||
    "https://via.placeholder.com/1200x800?text=Treatment";

  const levelLabel = (item?.level || "all")
    .toString()
    .replace(/^./, (c) => c.toUpperCase());

  const durationLabel =
    item?.duration ||
    (item?.durationMinutes ? `${item.durationMinutes} min` : "60 min");

  const bullets = Array.isArray(item?.bullets) ? item.bullets : [];
  const blurb = item?.description || item?.blurb || "";
  const priceLabel = item?.price
    ? `${item.price} ${item?.currency || "THB"}`
    : null;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Grid
        container
        spacing={4}
        direction={reverse ? "row-reverse" : "row"}
        alignItems="center"
        sx={{
          flexWrap: "nowrap",
          "@media (max-width:900px)": { flexWrap: "wrap" },
        }}
      >
        {/* IMAGE */}
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
            alt={item?.title || "Treatment"}
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

        {/* TEXT */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2} sx={{ maxWidth: 500, mx: "auto" }}>
            <Stack direction="row" spacing={1}>
              <Chip label={`${levelLabel} level`} size="small" />
              <Chip label={durationLabel} size="small" />
              {item?.intensity && (
                <Chip label={`${item.intensity} touch`} size="small" />
              )}
              {item?.category && <Chip label={item.category} size="small" />}
              {priceLabel && <Chip label={priceLabel} size="small" />}
            </Stack>

            <Typography variant="h4" fontWeight={800}>
              {item?.title || "Treatment"}
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
              <Button variant="contained">Book Now</Button>

              {/* 🟣 כפתור שפותח את הלו״ז */}
              <Button variant="text" onClick={() => onOpenSchedule(item._id)}>
                See Schedule
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

/* ---------------------------------------------------------
   PAGE
--------------------------------------------------------- */
export default function TreatmentsLanding() {
  const { items, loading, error } = useTreatments();

  const [openSchedule, setOpenSchedule] = React.useState(false);
  const [selectedTreatment, setSelectedTreatment] = React.useState(null);

  const handleOpenSchedule = (id) => {
    setSelectedTreatment(id);
    setOpenSchedule(true);
  };

  return (
    <Box sx={{ pb: { xs: 6, md: 10 } }}>
      <TreatmentsHero />

      {/* LOADING */}
      {loading && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading treatments…
            </Typography>
          </Stack>
        </Container>
      )}

      {/* ERROR */}
      {error && (
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert severity="error">{String(error)}</Alert>
        </Container>
      )}

      {/* EMPTY */}
      {!loading && !error && items?.length === 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            No treatments available yet.
          </Typography>
        </Container>
      )}

      {/* LIST */}
      {!loading &&
        !error &&
        items?.map((t, idx) => (
          <TreatmentSection
            key={t._id || idx}
            item={t}
            reverse={idx % 2 === 1}
            onOpenSchedule={handleOpenSchedule}
          />
        ))}

      {/* 🟣 DIALOG — לוח זמנים */}
      <Dialog
        open={openSchedule}
        onClose={() => setOpenSchedule(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ position: "relative", pt: 4 }}>
          <IconButton
            onClick={() => setOpenSchedule(false)}
            sx={{ position: "absolute", top: 12, right: 12 }}
          >
            <CloseIcon />
          </IconButton>

          {selectedTreatment && (
            <TreatmentSchedule treatmentId={selectedTreatment} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
