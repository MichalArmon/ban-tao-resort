// 📁 src/pages/retreats/RetreatsLanding.jsx
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import { useRetreats } from "../../context/RetreatsContext";

const YT_ID = "QU0oRjFPB8g";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1501117716987-c8e3f1f1a3ed?q=80&w=1400&auto=format&fit=crop";

/* ===========================
   HERO (YouTube 4K, Full Width)
   =========================== */
function RetreatsHero() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        height: { xs: "80vh", md: "70vh" },
        overflow: "hidden",
        backgroundColor: "black", // כדי שלא יראו רקע בהבזקי טעינה
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Box
          component="iframe"
          title="Retreat Hero Video"
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&loop=1&playlist=${YT_ID}&rel=0`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: 0,
            pointerEvents: "none",

            // ברירת מחדל: כיסוי לפי יחס 16:9
            width: "100vw",
            height: "56.25vw", // 9/16 של הרוחב

            // מסך צר/גבוה יותר מ-16:9 → מכסים לפי גובה
            "@media (max-aspect-ratio: 16/9)": {
              width: "177.78vh", // 16/9 * 100
              height: "100vh",
            },

            // מסך רחב יותר מ-16:9 → מכסים לפי רוחב
            "@media (min-aspect-ratio: 16/9)": {
              width: "100vw",
              height: "56.25vw",
            },
          }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          px: 2,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ color: "#fff", fontWeight: 400, letterSpacing: 2, mb: 1 }}
          >
            Explore Your Retreat Experience
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "rgba(255,255,255,0.9)", mb: 3 }}
          >
            Where Self-Care Meets Adventures
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowRounded />}
            sx={{
              px: 4,
              borderRadius: 0,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            href="#upcoming"
          >
            View Upcoming Retreats
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/* ===========================
   Card (BOOK / SOON / PRIVATE)
   =========================== */
const RetreatCard = React.memo(function RetreatCard({ item }) {
  const { title, place, dateLabel, status, image } = item;
  const s = String(status || "").toLowerCase();
  const isSoon = s === "soon";
  const isPrivate = s === "private";
  const isDisabled = isSoon || isPrivate;
  const cta = isPrivate ? "PRIVATE" : isSoon ? "SOON" : "BOOK";

  return (
    <Card
      elevation={0}
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: { lg: "300px", md: 250, sm: "100%" },
      }}
    >
      <CardMedia
        component="img"
        image={image}
        alt={title}
        loading="lazy" // ← טעינה עצלה לתמונות
        referrerPolicy="no-referrer"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied === "1") return; // מונע לולאה
          img.dataset.fallbackApplied = "1";
          img.onerror = null; // נטרול handler נוסף
          img.src = FALLBACK_IMG;
        }}
        sx={{
          height: 240,
          width: { md: 300, lg: 300, sm: "100%" },
          objectFit: "cover",
        }} // שומר על העיצוב שלך
      />

      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: "primary.dark", textAlign: "center" }}
        >
          {title}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={<CalendarMonthRounded />}
            label={dateLabel}
            size="small"
            variant="outlined"
          />
          {!!place && (
            <Typography variant="caption" color="text.secondary">
              {place}
            </Typography>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: "auto" }}>
          {isPrivate
            ? "Private event"
            : isSoon
            ? "Registration opens soon"
            : "Limited spots available"}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={isDisabled ? "outlined" : "contained"}
          size="medium"
          disabled={isDisabled}
          sx={{
            borderRadius: 1,
            ...(isDisabled
              ? {
                  pointerEvents: "none",
                  "&.Mui-disabled": {
                    opacity: 1,
                    color: "rgba(0,0,0,0.7)",
                    borderColor: "rgba(0,0,0,0.2)",
                    bgcolor: "#f5f5f5",
                    fontWeight: 600,
                  },
                }
              : {
                  bgcolor: "primary.main",
                  color: "#fff",
                  "&:hover": { bgcolor: "primary.dark" },
                }),
          }}
        >
          {cta}
        </Button>
      </Box>
    </Card>
  );
});

/* ===========================
   Page
   =========================== */
export default function RetreatsLanding() {
  const { loading, error, retreats } = useRetreats();

  // ---- Helpers (local) ----
  const MS_DAY = 24 * 60 * 60 * 1000;
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const toMs = (d) => startOfDay(d).getTime();

  const computeStatus = React.useCallback((r) => {
    const todayMs = toMs(new Date());
    const plus60Ms = todayMs + 60 * MS_DAY;
    if (r?.isPrivate) return "private";
    if (r?.isClosed) return "soon";
    if (r?.soldOut) return "soon";
    if (typeof r?.spotsLeft === "number" && r.spotsLeft <= 0) return "soon";
    if (r?.published === false) return "soon";
    const startMs = toMs(r.startDate);
    if (startMs > plus60Ms) return "soon";
    if (startMs >= todayMs) return "book";
    return "book";
  }, []);

  const dateRangeLabel = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    const s = new Date(startDate);
    const e = new Date(endDate);
    const sameDay =
      s.getFullYear() === e.getFullYear() &&
      s.getMonth() === e.getMonth() &&
      s.getDate() === e.getDate();
    if (sameDay) {
      return s
        .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
        .toUpperCase();
    }
    const sameMonth =
      s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
    if (sameMonth) {
      const d1 = s.toLocaleDateString("en-GB", { day: "numeric" });
      const d2 = e
        .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
        .toUpperCase();
      return `${d1}-${d2}`;
    }
    const d1 = s
      .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      .toUpperCase();
    const d2 = e
      .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      .toUpperCase();
    return `${d1} - ${d2}`;
  };

  const pickHero = (r) => r?.hero || r?.gallery?.[0]?.url || FALLBACK_IMG;

  // יציבות רפרנס לכרטיסים כדי שממו יעבוד טוב
  const mapCard = React.useCallback(
    (r) => ({
      id: r._id || r.name,
      title: r.name || "Untitled",
      place: r.location || r.place || "",
      dateLabel: dateRangeLabel(r.startDate, r.endDate),
      status: computeStatus(r),
      image: pickHero(r),
    }),
    [computeStatus]
  );

  // ---- Build future lists ----
  const futureSorted = React.useMemo(
    () =>
      (retreats || [])
        .filter((r) => toMs(r.endDate) >= toMs(new Date())) // future or ongoing
        .sort((a, b) => toMs(a.startDate) - toMs(b.startDate)),
    [retreats]
  );

  // Section 1: next 3 (any type)
  const top3 = React.useMemo(() => futureSorted.slice(0, 3), [futureSorted]);
  const top3Ids = React.useMemo(
    () => new Set(top3.map((r) => String(r._id || r.name))),
    [top3]
  );
  const top3Cards = React.useMemo(() => top3.map(mapCard), [top3, mapCard]);

  // Section 2: one-day next 3 (from ALL future)
  const isOneDay = (r) => toMs(r.startDate) === toMs(r.endDate);
  const oneDayTop3 = React.useMemo(
    () => futureSorted.filter(isOneDay).slice(0, 3),
    [futureSorted]
  );
  const oneDayCards = React.useMemo(
    () => oneDayTop3.map(mapCard),
    [oneDayTop3, mapCard]
  );

  // Section 3: ALL remaining future (exclude section 1)
  const restFuture = React.useMemo(
    () => futureSorted.filter((r) => !top3Ids.has(String(r._id || r.name))),
    [futureSorted, top3Ids]
  );
  const restCards = React.useMemo(
    () => restFuture.map(mapCard),
    [restFuture, mapCard]
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <RetreatsHero />

      {/* Quick Actions */}
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 5 }, display: { xs: "none", sm: "block" } }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="center"
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
        >
          {[
            "Day Retreats",
            "Healing Retreats",
            "Custom Retreat",
            "Gift Retreat",
            "Retreat Map",
          ].map((label) => (
            <Button
              key={label}
              variant="outlined"
              sx={{
                borderRadius: 0,
                px: 3,
                minHeight: 44,
                textTransform: "none",
              }}
              href="#upcoming"
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Container>

      {/* Loading / Error */}
      <Container maxWidth="lg" sx={{ pb: { xs: 2, md: 2 } }}>
        {loading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        )}
        {!!error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {String(error?.message || error)}
          </Alert>
        )}
      </Container>

      {!loading && (
        <Container id="upcoming" maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
          {/* ===== Section 1: Next 3 retreats ===== */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textTransform: "uppercase",
              mb: { xs: 3, md: 1 },
              fontWeight: 700,
              textAlign: "center",
              color: "primary.main",
              fontSize: { xs: 28, md: 44 },
            }}
          >
            Upcoming Retreats
          </Typography>
          <Typography
            variant="h6" // יותר גדול מ-subtitle2
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Not just a retreat — a reset for the soul
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{
              width: { xs: "100%", md: "90%" },
              maxWidth: 1200,
              mb: 6,
              mx: "auto",
            }}
          >
            {top3Cards.map((item) => (
              <Grid
                item
                key={item.id}
                xs={12}
                sm={6}
                md={4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ width: { sm: "100%", md: 300 }, maxWidth: 360 }}>
                  <RetreatCard item={item} />
                </Box>
              </Grid>
            ))}
            {top3Cards.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No upcoming retreats.
              </Typography>
            )}
          </Grid>

          <Divider sx={{ my: { xs: 4, md: 6 } }} />

          {/* ===== Section 2: One-day retreats (next 3 from all future) ===== */}
          <Typography
            variant="h5"
            sx={{
              mb: { xs: 3, md: 1 },
              fontWeight: 700,
              textAlign: "center",
              color: "primary.main",
              fontSize: { xs: 28, md: 32 },
            }}
          >
            1 Day Retreats
          </Typography>
          <Typography
            variant="h6" // יותר גדול מ-subtitle2
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            One day to breathe, reset, and reconnect.
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{
              width: { xs: "100%", md: "90%" },
              maxWidth: 1200,
              mb: 6,
              mx: "auto",
            }}
          >
            {oneDayCards.map((item) => (
              <Grid
                item
                key={item.id}
                xs={12}
                sm={6}
                md={4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ width: { md: 300, sm: "100%" }, maxWidth: 360 }}>
                  <RetreatCard item={item} />
                </Box>
              </Grid>
            ))}
            {oneDayCards.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No one-day retreats found.
              </Typography>
            )}
          </Grid>

          <Divider sx={{ my: { xs: 4, md: 6 } }} />

          {/* ===== Section 3: All remaining future (no limit) ===== */}
          <Typography
            variant="h5"
            sx={{
              mb: { xs: 3, md: 1 },
              fontWeight: 700,
              textAlign: "center",
              color: "primary.main",
              fontSize: { xs: 28, md: 32 },
            }}
          >
            More Upcoming Retreats
          </Typography>
          <Typography
            variant="h6" // יותר גדול מ-subtitle2
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Recharge your body and calm your mind.
          </Typography>

          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{
              width: { xs: "100%", md: "90%" },
              maxWidth: 1200,
              mx: "auto",
            }}
          >
            {restCards.map((item) => (
              <Grid
                item
                key={item.id}
                xs={12}
                sm={6}
                md={4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ width: { sm: "100%", md: 300 }, maxWidth: 360 }}>
                  <RetreatCard item={item} />
                </Box>
              </Grid>
            ))}
            {restCards.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No more upcoming retreats to show.
              </Typography>
            )}
          </Grid>
        </Container>
      )}
    </Box>
  );
}
