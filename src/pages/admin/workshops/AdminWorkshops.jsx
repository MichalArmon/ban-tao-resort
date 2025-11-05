// 📁 src/pages/admin/AdminWorkshops.jsx
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
import { useWorkshops } from "../../../context/WorkshopsContext";

export default function AdminWorkshops() {
  const navigate = useNavigate();

  // 🧠 לוקחים את הנתונים מהקונטקסט
  const { items, loading, error, listWorkshops } = useWorkshops();

  // 🔄 טוען את כל הסדנאות (כולל לא פעילות)
  useEffect(() => {
    listWorkshops({ sort: "title", limit: 200 });
  }, [listWorkshops]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          סדנאות קיימות
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/workshops/new")}
        >
          צור סדנה חדשה
        </Button>
      </Stack>

      {/* מצב טעינה */}
      {loading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      )}

      {/* שגיאה */}
      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* אין נתונים */}
      {!loading && !error && items.length === 0 && (
        <Typography color="text.secondary">לא נמצאו סדנאות</Typography>
      )}

      {/* רשימת סדנאות */}
      {!loading && items.length > 0 && (
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
                <TableCell>כותרת</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>מדריך</TableCell>
                <TableCell>משך</TableCell>
                <TableCell>קטגוריה</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell align="center">עריכה</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((w) => (
                <TableRow key={w._id} hover>
                  <TableCell>{w.title}</TableCell>
                  <TableCell>{w.slug}</TableCell>
                  <TableCell>{w.instructor}</TableCell>
                  <TableCell>{w.duration}</TableCell>
                  <TableCell>
                    {w.categoryId ? (
                      <Chip label={w.categoryId?.name || w.category} />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {w.isActive ? (
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
                      onClick={() => navigate(`/admin/workshops/edit/${w._id}`)}
                    >
                      ערוך
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
