import React, { useEffect } from "react";
import { Container } from "@mui/material";
import useRoomsConfig from "../../hooks/useRoomsConfig";
import Room from "./Room"; // אותו רכיב, נשתמש בו עם slug+embedded

export default function RoomsAll() {
  const { rooms, loading, error } = useRoomsConfig();

  // אם ה־hook שלך כבר טוען לבד, אין צורך ב-extra ensure.
  // ממפים את כל החדרים לפי ה־slug שלהם (אם אין, נגזור מ־key).

  if (loading) return null;
  if (error) return null;

  const entries = Object.entries(rooms || {}); // [[key, data], ...]
  return (
    <Container sx={{ py: { xs: 2, md: 4 } }}>
      {entries.map(([key, r]) => {
        const slug = (r?.slug || key || "").toLowerCase().replace(/\s+/g, "-");
        return <Room key={slug} slug={slug} embedded />;
      })}
    </Container>
  );
}
