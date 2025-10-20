import * as React from "react";
import { Box } from "@mui/material";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

function srcset(image, size, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

export default function ImageGallery() {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".gal-item"));

    const onScroll = () => {
      const vh = window.innerHeight;
      const centerY = vh / 2;
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        // מרכז האייטם יחסית לחלון
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - centerY); // מרחק מהמרכז
        // מיפוי למקדם [0..1] — קרוב למרכז => 1
        const influence = Math.max(0, 1 - dist / (vh * 0.9));
        // scale עדין בין 0.96 ל־1.06
        const scale = 0.96 + influence * 0.1;
        // אטימות עדינה
        const opacity = 0.6 + influence * 0.4;
        // מעט פרלקסה עדין מאוד
        const translateY = (0.5 - influence) * 10; // בין ~ -5 ל~5px

        el.style.transform = `translateY(${translateY}px) scale(${scale})`;
        el.style.opacity = opacity.toFixed(3);
      }
    };

    // קריאה ראשונית + מאזין
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        px: { xs: 2, md: 4 },
        my: 4,
      }}
    >
      <ImageList
        variant="quilted"
        cols={4}
        rowHeight={260}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          height: "auto",
          // מרווחים יפים בין תמונות
          "& .MuiImageListItem-root": {
            overflow: "hidden",
            borderRadius: 2,
          },
        }}
      >
        {itemData.map((item) => (
          <ImageListItem
            key={item.img}
            cols={item.cols || 1}
            rows={item.rows || 1}
          >
            <Box
              className="gal-item"
              sx={{
                width: "100%",
                height: "100%",
                transform: "scale(0.98)",
                opacity: 0.85,
                transition: "transform 300ms ease, opacity 300ms ease",
                willChange: "transform, opacity",
              }}
            >
              <img
                {...srcset(item.img, 160, item.rows, item.cols)}
                alt={item.title}
                loading="lazy"
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  display: "block",
                  pointerEvents: "none", // ❌ אין אפשרות ללחוץ
                  userSelect: "none",
                }}
              />
            </Box>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

/* דוגמאות תמונות */
const itemData = [
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    title: "Breakfast",
    rows: 2,
    cols: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    title: "Burger",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    title: "Camera",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    title: "Coffee",
    cols: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
    title: "Hats",
    cols: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
    rows: 2,
    cols: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8eW9nYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=500",
    title: "Basketball",
  },
  {
    img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
    title: "Fern",
  },
  {
    img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
    title: "Mushrooms",
    rows: 2,
    cols: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1567306301408-9b74779a11af",
    title: "Tomato basil",
  },
  {
    img: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1",
    title: "Sea star",
  },
  {
    img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
    title: "Bike",
    cols: 2,
  },
];
