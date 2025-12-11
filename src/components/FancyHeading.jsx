// 📁 src/components/FancyHeading.jsx
import React, { useRef, useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";

export default function FancyHeading({
  children,
  color = "primary.main",
  align = "left",
  size = "3rem",
  threshold = 0.3,
  mb = "1.5rem",
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true); // מפעיל את האנימציה
            observer.disconnect(); // כדי שלא ירוץ שוב
          }
        });
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Box
      ref={ref}
      sx={{
        mb,
      }}
    >
      <Typography
        {...props}
        sx={{
          fontFamily: "Parisienne, cursive",
          fontWeight: 400,
          fontSize: size,
          color,
          textAlign: align,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-20px)",
          transition: "all 0.8s ease",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
