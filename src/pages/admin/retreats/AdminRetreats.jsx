import React, { useEffect, useState } from "react";
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
import { get } from "../../../config/api";

export default function AdminRetreats() {
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await get("/retreats");
        setRetreats(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("❌ Error loading retreats:", e);
        setErr(e?.message || "שגיאה בטעינת רשימת הריטריטים");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("he-IL") : "—");

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          ריטריטים קיימים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/retreats/new")}
        >
          צור ריטריט חדש
        </Button>
      </Stack>

      {loading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      )}

      {!!err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {!loading && !err && retreats.length === 0 && (
        <Typography color="text.secondary">לא נמצאו ריטריטים</Typography>
      )}

      {!loading && retreats.length > 0 && (
        <Box
          sx={{
            overflowX: "auto",
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "background.paper" }}>
                <TableCell>שם</TableCell>
                <TableCell>תאריכים</TableCell>
                <TableCell>קטגוריה</TableCell>
                <TableCell>מחיר</TableCell>
                <TableCell>מצב</TableCell>
                <TableCell>פורסם</TableCell>
                <TableCell align="center">עריכה</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {retreats.map((r) => (
                <TableRow
                  key={r._id}
                  hover
                  sx={{
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    {r.name || "—"}
                  </TableCell>
                  <TableCell>
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </TableCell>
                  <TableCell>{r.category?.name || "—"}</TableCell>
                  <TableCell>
                    {r.price ? `${r.price.toLocaleString()} ₪` : "—"}
                  </TableCell>
                  <TableCell>
                    {r.isPrivate ? (
                      <Chip label="Private" color="default" />
                    ) : r.isClosed ? (
                      <Chip label="Soon" color="warning" />
                    ) : (
                      <Chip label="Book" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    {r.published ? (
                      <Chip label="Yes" color="success" />
                    ) : (
                      <Chip label="No" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/admin/retreats/edit/${r._id}`)}
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
