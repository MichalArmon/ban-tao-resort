// 📁 src/components/auth/SignupDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function SignupDialog({ open, onClose }) {
  const { signup } = useUser();

  const emptyForm = {
    email: "",
    password: "",
    phone: "",
    name: {
      first: "",
      last: "",
    },
    address: {
      country: "",
      city: "",
    },
    image: {
      url: "",
      alt: "",
    },
    birthDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 🎯 עדכון שדות כולל מקוננים
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // name.first → ["name","first"]
      const keys = name.split(".");
      setForm((prev) => {
        const next = structuredClone(prev);
        let obj = next;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys.at(-1)] = value;
        return next;
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🎯 SUBMIT + RESET
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await signup(form);
      setSuccess("Account created successfully!");

      // ⭐ איפוס טופס לאחר הרשמה
      setForm(emptyForm);

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || "Signup failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 600,
        }}
      >
        Create Your Account
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* NAME */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                name="name.first"
                value={form.name.first}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                name="name.last"
                value={form.name.last}
                onChange={handleChange}
                fullWidth
                required
              />
            </Stack>

            {/* EMAIL + PASSWORD */}
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* PHONE */}
            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
            />

            <Divider />

            {/* ADDRESS */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Country"
                name="address.country"
                value={form.address.country}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="City"
                name="address.city"
                value={form.address.city}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            {/* PROFILE IMAGE */}
            <TextField
              label="Profile Image URL"
              name="image.url"
              value={form.image.url}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Image Alt"
              name="image.alt"
              value={form.image.alt}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              type="date"
              label="Birth Date"
              name="birthDate"
              InputLabelProps={{ shrink: true }}
              value={form.birthDate}
              onChange={(e) => setField("birthDate", e.target.value)}
              fullWidth
              required
            />

            {/* SUBMIT */}
            <Button type="submit" variant="contained" size="large">
              Create Account
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
