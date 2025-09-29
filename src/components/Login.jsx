// pages/Login.jsx
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { loginWithGoogle } from "../firebase"; // הוספנו

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now just log the form data
    console.log("Login submitted:", form);
  };

  const handleGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      console.log("Google login:", user.user);
      // כאן בעתיד אפשר לשמור ב-Context או לשלוח לשרת
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {/* Form Login */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
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
            <Button variant="contained" color="primary" type="submit">
              Log In
            </Button>
          </Stack>
        </form>
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Typography variant="body2">Need an account?</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component={RouterLink}
              to="/guest/signup"
              size="small"
              variant="text"
            >
              Sign Up
            </Button>

            <Button size="small" variant="text" color="error">
              Sign out
            </Button>
          </Stack>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>or</Divider>

        {/* Google Login */}
        <Stack spacing={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGoogle}
            fullWidth
          >
            Continue with Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
