import React, { useMemo } from "react";
import {
  useParams,
  Link as RouterLink,
  Navigate,
  Outlet,
} from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Button,
  Alert,
} from "@mui/material";

// טפסים (החליפי בנתיבים האמיתיים אצלך בפרויקט)
import RoomForm from "./RoomForm"; // טופס יצירת סוג חדר/חדר
import RetreatForm from "./RetreatForm"; // טופס יצירת ריטריט
import TreatmentForm from "./TreatmentForm"; // טופס יצירת טיפול
import ClassForm from "./ClassForm";

import AdminCategories from "./AdminCategories";
import AdminWorkshops from "./AdminWorkshops"; // טופס יצירת סדנה/שיעור
// אפשר להוסיף גם UsersForm בהמשך

const ENTITY_MAP = {
  rooms: {
    title: "Create Room",
    component: RoomForm,
    cta: { label: "Go to Rooms", to: "/admin/create/rooms" },
  },
  retreats: {
    title: "Create Retreat",
    component: RetreatForm,
    cta: { label: "Go to Retreats", to: "/admin/create/retreats" },
  },
  treatments: {
    title: "Create Treatment",
    component: TreatmentForm,
    cta: { label: "Go to Treatments", to: "/admin/create/treatments" },
  },
  workshops: {
    title: "Create Class",
    component: AdminWorkshops,
    cta: { label: "Go to Workshops", to: "/admin/create/workshops" },
  },
  // ✅ חדש — קטגוריות
  categories: {
    title: "Create Category",
    component: AdminCategories,
    cta: { label: "Go to Categories", to: "/admin/create/categories" },
  },
};

export default function AdminCreate() {
  const { entity } = useParams(); // rooms | retreats | treatments | classes | users...
  const config = useMemo(() => ENTITY_MAP[entity], [entity]);

  // אם נכנסו ל-/admin בלבד אפשר להפנות לדיפולט (למשל rooms)
  if (!entity) return <Navigate to="/admin/create/rooms" replace />;

  if (!config) {
    return (
      <Box sx={{ pt: "var(--nav-h)", px: { xs: 2, md: 4 }, pb: 6 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          סוג אובייקט לא מוכר: <b>{entity}</b>
        </Alert>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/create/rooms"
          >
            Rooms
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/create/retreats"
          >
            Retreats
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/create/treatments"
          >
            Treatments
          </Button>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/create/workshops"
          >
            Workshops
          </Button>
          <Button component={RouterLink} to="/admin/create/categories">
            Categories
          </Button>
        </Stack>
      </Box>
    );
  }

  const FormComp = config.component;

  return (
    <Box sx={{ pt: "var(--nav-h)", px: { xs: 2, md: 4 }, pb: 6 }}>
      <Card variant="outlined">
        <CardHeader
          title={config.title}
          subheader="דף יצירה מרכזי: הטופס מתחלף לפי ה־entity ב־URL"
          action={
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/admin/create/rooms">
                Rooms
              </Button>
              <Button component={RouterLink} to="/admin/create/retreats">
                Retreats
              </Button>
              <Button component={RouterLink} to="/admin/create/treatments">
                Treatments
              </Button>
              <Button component={RouterLink} to="/admin/create/workshops">
                Workshops
              </Button>
              <Button
                component={RouterLink}
                to="/admin/create/workshops/schedule"
              >
                Workshops Schedule
              </Button>
              {/* ✅ זה מה שחסר לך */}
              <Button component={RouterLink} to="/admin/create/categories">
                Categories
              </Button>
            </Stack>
          }
        />

        <Divider />
        <CardContent>
          {/* כאן נטען הטופס המתאים */}

          <FormComp />
        </CardContent>
      </Card>
    </Box>
  );
}
