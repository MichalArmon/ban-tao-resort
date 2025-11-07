// 📁 src/pages/admin/treatments/AdminTreatments.jsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTreatments } from "../../../context/TreatmentsContext";
import { useNavigate } from "react-router-dom";

export default function AdminTreatments() {
  const {
    items: treatments,
    loading,
    error,
    listTreatments,
    deleteTreatment,
  } = useTreatments();
  const navigate = useNavigate();

  useEffect(() => {
    listTreatments();
  }, [listTreatments]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this treatment?"))
      return;
    try {
      await deleteTreatment(id);
      await listTreatments();
    } catch (e) {
      alert(e?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading treatments...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Treatments Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/treatments/new")}
        >
          Add New Treatment
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {treatments.length === 0 ? (
        <Alert severity="info">
          No treatments found. Click “Add New Treatment” to create one.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Therapist</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatments.map((t) => (
                <TableRow key={t._id || t.slug} hover>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.therapist || "—"}</TableCell>
                  <TableCell>
                    {t.duration || `${t.durationMinutes} min`}
                  </TableCell>
                  <TableCell>
                    {t.price ? `${t.price} ${t.currency || "THB"}` : "—"}
                  </TableCell>
                  <TableCell>{t.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate(`/admin/treatments/edit/${t._id}`)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(t._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
