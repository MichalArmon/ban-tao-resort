import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import SaveIcon from "@mui/icons-material/Save";
import { get, post } from "../../../config/api";
import { useNavigate, useParams } from "react-router-dom";

const ROLES = ["admin", "user"];

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    password: "",
  });

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  /* ---------------------------------------------------
     LOAD USER FOR EDIT
  --------------------------------------------------- */
  useEffect(() => {
    if (!id) return setLoading(false);

    async function load() {
      try {
        const user = await get(`/users/${id}`);
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          role: user.role || "user",
          password: "", // לא מציגים סיסמה
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  /* ---------------------------------------------------
     SAVE NEW USER (only register)
  --------------------------------------------------- */
  async function handleSave() {
    setErr("");
    setOk("");
    setSaving(true);

    try {
      if (!id) {
        // יצירת משתמש חדש — דרך register
        await post("/auth/register", {
          email: form.email,
          password: form.password,
          phone: "",
          name: {
            first: form.firstName,
            last: form.lastName,
          },
          address: {},
          image: {},
        });

        setOk("נוצר משתמש חדש!");
      } else {
        // ⚠️ אין API לעדכון משתמש אצלך
        // רק נציג הודעה
        setErr("⚠️ אין API לעדכון משתמש. קיים רק מחיקה/שליפה.");
      }
    } catch (e) {
      setErr(e.message || "Error saving user");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>טוען...</Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/admin/users")}
        sx={{ mb: 3 }}
      >
        חזרה לרשימה
      </Button>

      <Typography variant="h5" fontWeight={700} mb={3}>
        {id ? "עריכת משתמש" : "משתמש חדש"}
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 500 }}>
        <TextField
          label="שם פרטי"
          fullWidth
          value={form.firstName}
          onChange={(e) => setField("firstName", e.target.value)}
        />

        <TextField
          label="שם משפחה"
          fullWidth
          value={form.lastName}
          onChange={(e) => setField("lastName", e.target.value)}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
        />

        {!id && (
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
          />
        )}

        <TextField
          select
          label="Role"
          fullWidth
          value={form.role}
          onChange={(e) => setField("role", e.target.value)}
        >
          {ROLES.map((r) => (
            <MenuItem value={r} key={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        {err && <Alert severity="error">{err}</Alert>}
        {ok && <Alert severity="success">{ok}</Alert>}

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={handleSave}
        >
          {id ? "עדכון" : "יצירה"}
        </Button>
      </Stack>
    </Box>
  );
}
