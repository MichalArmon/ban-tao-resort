import { Container, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

function Pblock({ title, text, align = "left" }) {
  return (
    <Box maxWidth="100wv" sx={{ bgcolor: "background.default" }}>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box
            sx={{
              maxWidth: 820,
              mx: "auto",
              textAlign: align, // 👈 שליטה ביישור
            }}
          >
            <Typography
              component="h2"
              sx={{
                textTransform: "uppercase",
                letterSpacing: ".12em",
                fontWeight: 600,
                fontSize: { xs: 14, md: 16 },
                color: "text.primary",
                mb: 2,
              }}
            >
              {title}
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.secondary",
                lineHeight: 1.9,
                fontSize: { xs: 15, md: 17 },
                maxWidth: 760,
                mx: align === "center" ? "auto" : 0,
              }}
            >
              {text}
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Pblock;
