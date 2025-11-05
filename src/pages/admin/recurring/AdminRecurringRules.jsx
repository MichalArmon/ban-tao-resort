// 📁 src/pages/admin/AdminRecurringRules.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import RuleFormModal from "./RuleFormModal";
import { useRecurringRules } from "../../../context/RecurringRulesContext";
import { useWorkshops } from "../../../context/WorkshopsContext";

/* ===========================
   Constants
   =========================== */
const DAY_MAP = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

const DOW_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// RFC5545 (RRULE) 2-letter day -> index
const RR_SHORT_TO_IDX = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

/* ===========================
   Component
   =========================== */
export default function AdminRecurringRules() {
  /* ---------- Context hooks ---------- */
  const { rules, loading, error, loadRules, deleteRule } = useRecurringRules();

  const {
    items: workshops,
    loading: loadingWorkshops,
    listWorkshops, // load all workshops list
    error: workshopsError,
  } = useWorkshops();

  /* ---------- Local state ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);

  /* ---------- Effects ---------- */
  useEffect(() => {
    // load base data
    loadRules();
    listWorkshops();
  }, [loadRules, listWorkshops]);

  /* ---------- Derived maps for fast lookup ---------- */
  const byId = useMemo(
    () => new Map(workshops.map((w) => [String(w?._id), w])),
    [workshops]
  );

  const bySlug = useMemo(
    () => new Map(workshops.map((w) => [String(w?.slug || ""), w])),
    [workshops]
  );

  /* ---------- Helpers ---------- */
  // Resolve workshop title regardless of how the rule stores it:
  // - rule.workshop populated object { _id, title }
  // - rule.workshopId string ObjectId
  // - rule.workshopId object { _id }
  // - rule.workshop / rule.workshop_id variants
  // - slug fallback
  const resolveWorkshopTitle = (rule) => {
    // 1) populated object on `workshop` or `workshopId`
    if (rule?.workshop && typeof rule.workshop === "object") {
      return (
        rule.workshop.title ||
        byId.get(String(rule.workshop._id || ""))?.title ||
        "Workshop Not Found"
      );
    }
    if (rule?.workshopId && typeof rule.workshopId === "object") {
      return (
        rule.workshopId.title ||
        byId.get(String(rule.workshopId._id || ""))?.title ||
        "Workshop Not Found"
      );
    }

    // 2) raw id / slug in various fields
    const raw =
      rule?.workshopId ?? rule?.workshop_id ?? rule?.workshop ?? rule?.slug;

    if (!raw) return "Workshop Not Found";

    const asStr = String(raw);
    return (
      byId.get(asStr)?.title ||
      bySlug.get(asStr)?.title ||
      // if server returned just a title string by mistake
      (rule?.title && typeof rule.title === "string" ? rule.title : null) ||
      "Workshop Not Found"
    );
  };

  // -------- Parse day label from RRULE (without "Last"/"First") + fallbacks --------
  const getRuleDayLabel = (rule) => {
    // A) explicit day fields (number/string) if exist
    const explicit =
      rule?.day ?? rule?.dayOfWeek ?? rule?.weekday ?? rule?.dow ?? null;
    if (explicit != null) {
      if (!isNaN(explicit)) {
        const idx = Number(explicit);
        return DOW_LABELS[idx] ?? "—";
      }
      const s = String(explicit).trim();
      if (DAY_MAP[s]) return DAY_MAP[s];
      const cap = s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
      if (DAY_MAP[cap?.slice(0, 3)]) return DAY_MAP[cap.slice(0, 3)];
    }

    // B) derive from RRULE BYDAY (ignore ordinals like 1MO/-1SU)
    const r = String(rule?.rrule || "");
    const bydayMatch = r.match(/BYDAY=([^;]+)/i);
    if (bydayMatch) {
      const raw = bydayMatch[1]; // e.g. "MO,WE" | "SA" | "1MO" | "-1SU"
      const parts = raw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      // keep only the two-letter day code -> label
      const names = parts
        .map((p) => p.slice(-2).toUpperCase())
        .map((d2) => {
          const idx = RR_SHORT_TO_IDX[d2];
          return idx != null ? DOW_LABELS[idx] : d2;
        });

      return names.join(", ");
    }

    // C) soft fallback: try effectiveFrom
    if (rule?.effectiveFrom) {
      const d = new Date(rule.effectiveFrom);
      if (!isNaN(d.getTime())) return DOW_LABELS[d.getDay()];
    }

    return "—";
  };

  const handleAddRule = () => {
    setRuleToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule) => {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (
      window.confirm("Are you sure you want to delete this recurring rule?")
    ) {
      try {
        await deleteRule(ruleId);
      } catch (e) {
        alert("Failed to delete rule: " + (e?.message || "Error"));
      }
    }
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    loadRules(); // refresh after create/update
  };

  /* ---------- Loading / Error states ---------- */
  if (loading || loadingWorkshops) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading rules and workshops...</Typography>
      </Box>
    );
  }

  if (error || workshopsError) {
    return (
      <Box sx={{ p: 3 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {workshopsError && <Alert severity="error">{workshopsError}</Alert>}
      </Box>
    );
  }

  /* ---------- Render ---------- */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Weekly Recurring Rules Manager
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Define the base schedule. These rules are used to generate the final
        client schedule.
      </Typography>

      <Button variant="contained" onClick={handleAddRule} sx={{ mb: 2 }}>
        + Add New Rule
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 720 }} aria-label="recurring rules table">
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Studio</TableCell>
              <TableCell>Workshop</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No recurring rules defined yet.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule._id} hover>
                  <TableCell component="th" scope="row">
                    {getRuleDayLabel(rule)}
                  </TableCell>
                  <TableCell>{rule.startTime}</TableCell>
                  <TableCell>{rule.durationMin ?? rule.duration} min</TableCell>
                  <TableCell>{rule.studio}</TableCell>
                  <TableCell>{resolveWorkshopTitle(rule)}</TableCell>

                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditRule(rule)}
                        aria-label="edit"
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRule(rule._id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Edit */}
      <RuleFormModal
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        ruleToEdit={ruleToEdit}
        workshops={workshops}
        onSuccess={handleFormSubmit}
      />
    </Box>
  );
}
