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
import { get } from "../../../config/api";

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);

      // ⭐ השרת מחזיר ישירות מערך — לא data: [...]
      const res = await get("/users");

      setUsers(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          משתמשים
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/users/new")}
        >
          משתמש חדש
        </Button>
      </Stack>

      {loading && (
        <Stack alignItems="center" py={4}>
          <CircularProgress />
        </Stack>
      )}

      {!!error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && users.length === 0 && (
        <Typography color="text.secondary">אין משתמשים</Typography>
      )}

      {!loading && users.length > 0 && (
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
                <TableCell>אימייל</TableCell>
                <TableCell>תפקיד</TableCell>
                <TableCell align="center">עריכה</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((u) => {
                const fullName =
                  `${u.firstName || ""} ${u.lastName || ""}`.trim() || "—";

                return (
                  <TableRow key={u._id}>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        color={u.role === "admin" ? "primary" : "default"}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/admin/users/edit/${u._id}`)}
                        sx={{
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "#fff",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        עריכה
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
