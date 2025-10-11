// src/components/RoomPreviewDialog.jsx
import * as React from "react";
import {
  Dialog,
  IconButton,
  Typography,
  useMediaQuery,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import Room from "../../pages/rooms/Room";

export default function RoomPreviewDialog({ open, onClose, slug, title }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md")); // מובייל = מסך מלא

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          // גובה וניהול פריסה כדי שהגלילה תהיה בתוכן ולא בחלון כולו
          height: fullScreen ? "100dvh" : "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* כותרת עדינה במקום AppBar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 3 },
          py: { xs: 1.25, md: 1.5 },
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
          {title || "Room"}
        </Typography>
        <IconButton edge="end" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* התוכן גולל */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {/* מצב מוטמע כדי שייראה טוב בתוך דיאלוג */}
        <Room slug={slug} embedded />
      </Box>
    </Dialog>
  );
}
