// src/pages/SignUp.jsx
import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "Abc!123Abc",
    name: { first: "Michal", middle: "", last: "" },
    phone: "",
    image: {
      url: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
      alt: "",
    },
    address: {
      state: "IL",
      country: "Israel",
      city: "",
      street: "",
      houseNumber: "",
      zip: "",
    },
    isBusiness: true,
  });

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    msg: "",
  });

  // עדכון שדה מקונן לפי name="name.first" / "address.city" וכו'
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split(".");
    setForm((prev) => {
      const next = structuredClone(prev);
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys.at(-1)] = type === "checkbox" ? checked : value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // כרגע: דמו בלבד. אפשר:
      // 1) לחבר לפיירבייס createUserWithEmailAndPassword
      // 2) או לשלוח לשרת שלך: POST /api/public/signup עם body=form
      console.log("Signup payload:", form);

      setSnack({
        open: true,
        severity: "success",
        msg: "Signed up successfully!",
      });
      setTimeout(() => navigate("/guest/booking"), 1200);
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        msg: err.message || "Signup failed",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)", // אם יש AppBar fixed בגובה ~80px
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 3, width: "100%", maxWidth: 760 }}>
        <Typography variant="h5" gutterBottom align="center">
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Name */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                name="name.first"
                value={form.name.first}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Middle Name"
                name="name.middle"
                value={form.name.middle}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Last Name"
                name="name.last"
                value={form.name.last}
                onChange={handleChange}
                required
                fullWidth
              />
            </Stack>

            {/* Contact */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                fullWidth
                autoComplete="new-password"
              />
            </Stack>

            <TextField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              fullWidth
            />

            {/* Image */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Image URL"
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
            </Stack>

            {/* Address */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Country"
                name="address.country"
                value={form.address.country}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="State"
                name="address.state"
                value={form.address.state}
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Street"
                name="address.street"
                value={form.address.street}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="House Number"
                name="address.houseNumber"
                value={form.address.houseNumber}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="ZIP Code"
                name="address.zip"
                value={form.address.zip}
                onChange={handleChange}
                fullWidth
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  name="isBusiness"
                  checked={form.isBusiness}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Business account"
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
              <Button component={RouterLink} to="/guest/login" variant="text">
                Back to Login
              </Button>
              <Button type="submit" variant="contained">
                Create Account
              </Button>
            </Stack>
          </Stack>
        </form>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={2000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            severity={snack.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
