// 📁 src/components/booking/BookingFormDialog.jsx
import * as React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import BookingForm from "./BookingForm";

/**
 * פופ־אפ שמכיל את BookingForm.
 * BookingForm יכול לקבל onSuccess כדי לסגור אחרי יצירה/תשלום.
 */
export default function BookingFormDialog({
  open,
  onClose,
  roomType,
  retreatId,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
        Book
        <IconButton sx={{ ml: "auto" }} onClick={onClose} aria-label="Close">
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <BookingForm
          roomType={roomType}
          retreatId={retreatId}
          onSuccess={onClose} // אם תרצי לסגור אחרי שליחה
        />
      </DialogContent>
    </Dialog>
  );
}
