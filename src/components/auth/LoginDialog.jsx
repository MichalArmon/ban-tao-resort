// 📁 src/components/auth/LoginDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Alert,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function LoginDialog({ open, onClose, onOpenSignup }) {
  const { login } = useUser();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);

      // 🔒 Success — close dialog
      onClose();
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Login
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
            />

            <Button variant="contained" type="submit" size="large">
              Log In
            </Button>

            <Button
              variant="text"
              sx={{ textTransform: "none", fontSize: 14 }}
              onClick={onOpenSignup}
            >
              Need an account? Sign up
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
