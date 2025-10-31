// 📁 src/pages/admin/components/RuleFormModal.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Modal,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useRecurringRules } from "../../context/RecurringRulesContext";

// --------------------------------------------------
// Lists & helpers
// --------------------------------------------------
const DAYS = [
  { key: "Sun", label: "Sunday" },
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
];

const STUDIOS = [
  { key: "Studio A", label: "Studio A" },
  { key: "Studio B", label: "Studio B" },
];

const RR_DAY = {
  Sun: "SU",
  Mon: "MO",
  Tue: "TU",
  Wed: "WE",
  Thu: "TH",
  Fri: "FR",
  Sat: "SA",
};
const RR_DAY_INV = {
  SU: "Sun",
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
};

const POS_OPTIONS = [
  { value: "", label: "(none)" },
  { value: 1, label: "First" },
  { value: 2, label: "Second" },
  { value: 3, label: "Third" },
  { value: 4, label: "Fourth" },
  { value: 5, label: "Fifth" },
  { value: -1, label: "Last" },
];

const TZ = "Asia/Jerusalem";

// modal style
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

// Build a valid RFC5545 RRULE
const buildRRule = ({ freq, dayKey, bySetPos }) => {
  const d2 = RR_DAY[dayKey];
  const parts = [`FREQ=${freq}`];
  if (d2) parts.push(`BYDAY=${d2}`);
  if (
    freq === "MONTHLY" &&
    bySetPos !== "" &&
    bySetPos !== undefined &&
    bySetPos !== null
  ) {
    parts.push(`BYSETPOS=${bySetPos}`);
  }
  return parts.join(";");
};

// Parse fields from an existing rrule (for edit mode)
const parseFromRRule = (rrule = "") => {
  const out = { freq: "WEEKLY", dayKey: "", bySetPos: "" };
  const r = String(rrule);

  const f = r.match(/FREQ=([A-Z]+)/i);
  if (f) out.freq = f[1].toUpperCase();

  const byday = r.match(/BYDAY=([^;]+)/i);
  if (byday) {
    const token = byday[1].split(",")[0].trim(); // we expect single day in this UI
    const d2 = token.slice(-2).toUpperCase(); // handle "1MO" / "-1SU" too
    out.dayKey = RR_DAY_INV[d2] || "";
  }

  const pos = r.match(/BYSETPOS=([+-]?\d+)/i);
  if (pos) out.bySetPos = Number(pos[1]);

  return out;
};

// --------------------------------------------------
// Component
// --------------------------------------------------
export default function RuleFormModal({
  isOpen,
  handleClose,
  ruleToEdit, // existing rule (or null)
  workshops = [], // list of workshops (id + title)
  onSuccess, // callback after successful save
}) {
  const { createRule, updateRule, error: contextError } = useRecurringRules();
  const isEditMode = !!ruleToEdit;

  const parsed = parseFromRRule(ruleToEdit?.rrule);

  const [formData, setFormData] = useState({
    // UI fields
    day: parsed.dayKey || "",
    startTime: ruleToEdit?.startTime || "08:00", // "HH:mm"
    duration: Number(ruleToEdit?.durationMin ?? ruleToEdit?.duration ?? 60),
    studio: ruleToEdit?.studio || "Studio A",
    workshopId:
      typeof ruleToEdit?.workshopId === "object"
        ? String(ruleToEdit?.workshopId?._id || "")
        : String(ruleToEdit?.workshopId || ""),
    freq: parsed.freq, // WEEKLY | MONTHLY
    bySetPos: parsed.bySetPos === "" ? "" : parsed.bySetPos, // number | ""
    effectiveFrom: ruleToEdit?.effectiveFrom
      ? new Date(ruleToEdit.effectiveFrom).toISOString().slice(0, 10) // YYYY-MM-DD
      : new Date().toISOString().slice(0, 10),
    isActive: ruleToEdit?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // reset when ruleToEdit changes
  useEffect(() => {
    if (!isEditMode) return;
    const p = parseFromRRule(ruleToEdit?.rrule);
    setFormData({
      day: p.dayKey || "",
      startTime: ruleToEdit?.startTime || "08:00",
      duration: Number(ruleToEdit?.durationMin ?? ruleToEdit?.duration ?? 60),
      studio: ruleToEdit?.studio || "Studio A",
      workshopId:
        typeof ruleToEdit?.workshopId === "object"
          ? String(ruleToEdit?.workshopId?._id || "")
          : String(ruleToEdit?.workshopId || ""),
      freq: p.freq,
      bySetPos: p.bySetPos === "" ? "" : p.bySetPos,
      effectiveFrom: ruleToEdit?.effectiveFrom
        ? new Date(ruleToEdit.effectiveFrom).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      isActive: ruleToEdit?.isActive ?? true,
    });
  }, [isEditMode, ruleToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val =
      type === "number"
        ? Number(value)
        : type === "checkbox"
        ? Boolean(checked)
        : value;
    setFormData((s) => ({ ...s, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // basic validation
    if (
      !formData.day ||
      !formData.startTime ||
      !formData.studio ||
      !formData.workshopId
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // verify workshop id exists in list (and stringify)
      const chosen = workshops.find(
        (w) => String(w._id) === String(formData.workshopId)
      );
      const workshopId = chosen
        ? String(chosen._id)
        : String(formData.workshopId);

      // build RRULE
      const rrule = buildRRule({
        freq: formData.freq,
        dayKey: formData.day,
        bySetPos: formData.freq === "MONTHLY" ? formData.bySetPos : "",
      });

      // build payload exactly as server expects
      const payload = {
        workshopId, // ObjectId as string
        studio: formData.studio,
        timezone: TZ,
        startTime: formData.startTime, // "HH:mm"
        durationMin: Number(formData.duration),
        rrule,
        effectiveFrom: new Date(
          `${formData.effectiveFrom}T00:00:00.000Z`
        ).toISOString(),
        exceptions: [],
        isActive: Boolean(formData.isActive),
      };

      if (isEditMode) {
        await updateRule(ruleToEdit._id, payload);
      } else {
        await createRule(payload);
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      // show server message if exists
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to save rule.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {isEditMode ? "Edit Recurring Rule" : "Add New Recurring Rule"}
        </Typography>

        {(error || contextError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || contextError}
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Workshop */}
          <TextField
            select
            required
            label="Workshop"
            name="workshopId"
            value={formData.workshopId}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="">— Select Workshop —</MenuItem>
            {workshops.map((w) => (
              <MenuItem key={w._id} value={w._id}>
                {w.title}
              </MenuItem>
            ))}
          </TextField>

          {/* Studio */}
          <TextField
            select
            required
            label="Studio"
            name="studio"
            value={formData.studio}
            onChange={handleChange}
            fullWidth
          >
            {STUDIOS.map((s) => (
              <MenuItem key={s.key} value={s.key}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Frequency */}
          <TextField
            select
            label="Frequency"
            name="freq"
            value={formData.freq}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="WEEKLY">Weekly</MenuItem>
            <MenuItem value="MONTHLY">Monthly</MenuItem>
          </TextField>

          {/* Day (single) */}
          <TextField
            select
            required
            label="Day of Week"
            name="day"
            value={formData.day}
            onChange={handleChange}
            fullWidth
          >
            {DAYS.map((d) => (
              <MenuItem key={d.key} value={d.key}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>

          {/* BYSETPOS only for MONTHLY */}
          {formData.freq === "MONTHLY" && (
            <TextField
              select
              label="BYSETPOS (optional)"
              name="bySetPos"
              value={formData.bySetPos}
              onChange={handleChange}
              fullWidth
            >
              {POS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Time */}
          <TextField
            required
            label="Start Time (HH:mm)"
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={handleChange}
            fullWidth
            inputProps={{ step: 300 }}
          />

          {/* Duration */}
          <TextField
            required
            label="Duration (minutes)"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 15, step: 5 }}
          />

          {/* Effective From */}
          <TextField
            label="Effective From"
            name="effectiveFrom"
            type="date"
            value={formData.effectiveFrom}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          {/* Active */}
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            }
            label="Active"
          />

          <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : isEditMode ? (
                "Save"
              ) : (
                "Create"
              )}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}
