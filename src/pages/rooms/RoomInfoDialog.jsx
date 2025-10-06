import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  ImageList,
  ImageListItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
// התאימי למסלול שבו השתמשת בשאר הפרויקט (אותו כמו ב-RoomCard)
import { useBooking } from "../../context/BookingContext";
import { pub } from "../../utils/publicPath";

export default function RoomInfoDialog({ open, onClose, room }) {
  const { checkIn, checkOut, fetchQuote } = useBooking();

  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteErr, setQuoteErr] = useState("");

  const [staticInfo, setStaticInfo] = useState(null);
  const [loadingStatic, setLoadingStatic] = useState(false);
  const [staticErr, setStaticErr] = useState("");

  const roomTypeKey = room?.roomType;

  // מחיר/זמינות מהשרת
  useEffect(() => {
    let ignore = false;
    if (!open || !roomTypeKey) return;
    (async () => {
      setLoadingQuote(true);
      setQuoteErr("");
      try {
        const data = await fetchQuote(roomTypeKey, checkIn, checkOut);
        if (!ignore) setQuote(data);
      } catch (e) {
        if (!ignore) setQuoteErr("Failed to fetch price/availability");
      } finally {
        if (!ignore) setLoadingQuote(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [open, roomTypeKey, checkIn, checkOut, fetchQuote]);

  // מידע סטטי מה-public/rooms.json
  useEffect(() => {
    let ignore = false;
    if (!open || !roomTypeKey) return;
    (async () => {
      setLoadingStatic(true);
      setStaticErr("");
      try {
        const res = await fetch(pub("rooms.json"));
        const json = await res.json();
        if (!ignore) setStaticInfo(json[roomTypeKey] || null);
      } catch (e) {
        if (!ignore) setStaticErr("Failed to load static room info");
      } finally {
        if (!ignore) setLoadingStatic(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [open, roomTypeKey]);

  const title = useMemo(
    () => staticInfo?.title || room?.name || roomTypeKey || "Room details",
    [staticInfo, room, roomTypeKey]
  );

  const fmt = (d) =>
    d?.format?.("YYYY-MM-DD") || (typeof d === "string" ? d : "");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* גלריית תמונות */}
        <Box sx={{ mb: 2 }}>
          {loadingStatic ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress />
            </Stack>
          ) : staticErr ? (
            <Typography color="error">{staticErr}</Typography>
          ) : staticInfo?.images?.length ? (
            <ImageList cols={3} gap={8} sx={{ m: 0 }}>
              {staticInfo.images.map((rel, i) => (
                <ImageListItem key={i}>
                  <img
                    src={pub(rel)}
                    alt={`${title} ${i + 1}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 220,
                bgcolor: "grey.100",
                borderRadius: 2,
              }}
            />
          )}
        </Box>

        {/* מחיר/זמינות */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Availability & Price
          </Typography>
          {loadingQuote ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress size={20} /> <Typography>Checking…</Typography>
            </Stack>
          ) : quoteErr ? (
            <Typography color="error">{quoteErr}</Typography>
          ) : quote ? (
            <Stack
              direction="row"
              alignItems="baseline"
              gap={2}
              flexWrap="wrap"
            >
              <Typography variant="h4">
                {quote.currency || "$"}
                {quote.totalPrice}
              </Typography>
              <Chip
                label={quote.isRetreatPrice ? "Retreat rate" : "Standard rate"}
                color={quote.isRetreatPrice ? "secondary" : "default"}
                size="small"
              />
              <Typography sx={{ opacity: 0.7 }}>
                {fmt(checkIn)} → {fmt(checkOut)}
              </Typography>
            </Stack>
          ) : (
            <Typography sx={{ opacity: 0.7 }}>
              No quote returned for these dates.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* פרטים סטטיים */}
        <Stack spacing={1}>
          <Typography variant="h6">Room details</Typography>

          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
            {staticInfo?.sizeM2 && (
              <Chip label={`${staticInfo.sizeM2} m²`} size="small" />
            )}
            {staticInfo?.maxGuests && (
              <Chip label={`Max ${staticInfo.maxGuests} guests`} size="small" />
            )}
          </Stack>

          {!!staticInfo?.features?.length && (
            <>
              <Typography fontWeight={600}>Features</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                {staticInfo.features.map((f, i) => (
                  <Chip key={i} label={f} size="small" variant="outlined" />
                ))}
              </Stack>
            </>
          )}

          {!!staticInfo?.amenities?.length && (
            <>
              <Typography fontWeight={600}>Amenities</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {staticInfo.amenities.map((a, i) => (
                  <Chip key={i} label={a} size="small" />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
