// 📁 src/pages/classes/ClassesLanding.jsx
import * as React from "react";
import { useState } from "react";
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
  Modal,
} from "@mui/material";
import { useWorkshops } from "../../../context/WorkshopsContext";
import BookButton from "../../../components/booking/BookButton";
import CloseIcon from "@mui/icons-material/Close";
import GuestScheduleView from "./GuestScheduleView";

/* ==========  סטיילינג Modal  ========== */
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "85%" },
  maxWidth: "1200px",
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  borderRadius: 2,
  outline: "none",
};

/* ==========  Hero (נשאר זהה)  ========== */
function ClassesHero() {
  // ... [הקוד של ClassesHero נשאר זהה] ...
}

/* ==========  Alternating section (ClassSection)  ========== */
function ClassSection({ item, reverse = false }) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const handleOpen = () => setIsScheduleOpen(true);
  const handleClose = () => setIsScheduleOpen(false);

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
  const workshopTitle = item?.title || "Workshop Schedule";

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
              <BookButton
                variant="contained"
                size="medium"
                type="workshop"
                item={item}
              />
              <Button variant="outlined" onClick={handleOpen}>
                See Schedule
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Modal
        open={isScheduleOpen}
        onClose={handleClose}
        aria-labelledby="schedule-modal-title"
        aria-describedby="schedule-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="schedule-modal-title"
            variant="h5"
            sx={{ mb: 2, fontWeight: 700 }}
          >
            לוח זמנים: {workshopTitle}
            <Button
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: "auto",
                p: 1,
                color: "text.primary",
              }}
            >
              <CloseIcon />
            </Button>
          </Typography>

          <GuestScheduleView
            open={isScheduleOpen}
            onClose={handleClose}
            workshop={item}
          />
        </Box>
      </Modal>
    </Container>
  );
}

/* ==========  Page (נשאר זהה)  ========== */
export default function ClassesLanding() {
  const { items, loading, error } = useWorkshops();

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
