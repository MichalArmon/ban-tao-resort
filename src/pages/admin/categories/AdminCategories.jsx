import * as React from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Alert,
  Grid,
  IconButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import { useCategories } from "../../../context/CategoriesContext"; // ✅ שימוש בקונטקסט

export default function AdminCategories() {
  const {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    deleteCategory,
  } = useCategories();

  const [form, setForm] = React.useState({
    name: "",
    color: "#6ab04c",
    types: [],
    icon: "",
  });

  const [message, setMessage] = React.useState("");
  const TYPE_OPTIONS = ["workshop", "retreat", "treatment", "room"];

  /* ============================
   * LOAD
   * ============================ */
  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /* ============================
   * HANDLERS
   * ============================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleTypeToggle = (type) => {
    setForm((f) => {
      const exists = f.types.includes(type);
      const updatedTypes = exists
        ? f.types.filter((t) => t !== type)
        : [...f.types, type];
      return { ...f, types: updatedTypes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || form.types.length === 0) {
      setMessage("❌ Missing required fields");
      return;
    }

    try {
      await createCategory(form);
      setMessage("✅ Category created successfully!");
      setForm({ name: "", color: "#6ab04c", types: [], icon: "" });
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message || "Failed to create category"}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  /* ============================
   * RENDER
   * ============================ */
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Manage Categories
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Create new category
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 500,
          }}
        >
          <TextField
            name="name"
            label="Category name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <Typography variant="subtitle2">Types</Typography>
          <FormGroup row>
            {TYPE_OPTIONS.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={form.types.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="color"
              name="color"
              label="Color"
              value={form.color}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 150 }}
            />
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: form.color,
                border: "1px solid #ccc",
              }}
            />
          </Stack>

          <TextField
            name="icon"
            label="Icon (optional)"
            value={form.icon}
            onChange={handleChange}
            fullWidth
          />

          {message && (
            <Alert
              severity={message.startsWith("✅") ? "success" : "error"}
              sx={{ mt: 1 }}
            >
              {message}
            </Alert>
          )}

          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {loading ? "Loading..." : "Create Category"}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Existing categories
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : categories.length === 0 ? (
        <Typography color="text.secondary">No categories yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={cat._id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: cat.color,
                    }}
                  />
                  <Box>
                    <Typography fontWeight={600}>{cat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.types?.join(", ")}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleDelete(cat._id)}
                >
                  <DeleteRounded fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
