import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useRooms } from "../../../context/RoomContext";

export default function AdminRooms() {
  const navigate = useNavigate();
  const { types, loadingTypes, typesError, ensureTypes, setSelectedRoom } =
    useRooms();

  useEffect(() => {
    ensureTypes();
  }, [ensureTypes]);
  // 🩵 תוסיפי את זה ↓↓↓
  useEffect(() => {
    console.log("💬 types from server:", types);
  }, [types]);

  const handleEdit = (room) => {
    navigate(`/admin/rooms/edit/${room._id}`); // מנווט לדף העריכה
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* כותרת + כפתור יצירה */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          סוגי חדרים קיימים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/rooms/new")}
        >
          צור חדר חדש
        </Button>
      </Stack>

      {/* טעינה */}
      {loadingTypes && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      )}

      {/* שגיאה */}
      {!!typesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typesError.message || "שגיאה בטעינת רשימת החדרים"}
        </Alert>
      )}

      {/* אין חדרים */}
      {!loadingTypes && !typesError && types.length === 0 && (
        <Typography color="text.secondary">לא נמצאו חדרים</Typography>
      )}

      {/* רשימת חדרים */}
      {!loadingTypes && types.length > 0 && (
        <Box
          sx={{
            overflowX: "auto",
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>שם</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>מחיר</TableCell>
                <TableCell>מטבע</TableCell>
                <TableCell>אורחים</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell align="center">עריכה</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {types.map((r) => (
                <TableRow key={r._id || r.slug} hover>
                  {/* 💡 לחיצה על שם החדר גם פותחת את העריכה */}
                  <TableCell
                    onClick={() => handleEdit(r)}
                    sx={{
                      cursor: "pointer",
                      color: "primary.main",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {r.title}
                  </TableCell>

                  <TableCell>{r.slug}</TableCell>
                  <TableCell>{r.priceBase}</TableCell>
                  <TableCell>{r.currency}</TableCell>
                  <TableCell>{r.maxGuests}</TableCell>

                  <TableCell>
                    {r.active ? (
                      <Chip label="Active" color="success" />
                    ) : (
                      <Chip label="Inactive" color="default" />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(r)}
                      sx={{
                        textTransform: "none",
                        transition: "0.2s",
                        "&:hover": {
                          bgcolor: "primary.main",
                          color: "white",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      עריכה
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
