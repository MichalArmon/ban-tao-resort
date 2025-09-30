import { Container, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

function IntroBlock() {
  return (
    <Box maxWidth="100wv" sx={{ bgcolor: "background.default" }}>
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }} // יופיע כש-25% מהאלמנט נכנס למסך
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box sx={{ maxWidth: 820, mx: "auto" /* עמודה צרה במרכז */ }}>
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
              WELCOME TO BAN TAO LIVING IN Koh Phangan
            </Typography>

            <Typography
              component="p"
              sx={{
                color: "text.secondary",
                lineHeight: 1.9,
                fontSize: { xs: 15, md: 17 },
                maxWidth: 760, // קצת צר יותר מהכותרת
              }}
            >
              BAN TAO presents 10 artistic-minimalist villas in Koh Phangan,
              each with a private pool and stunning living spaces, where
              timeless living meets the tropics. Choosing BAN TAO Phangan means
              embracing a lifestyle that rises above the ordinary. Here, we
              celebrate the exceptional and redefine what it means to live in
              Koh Phangan.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

export default IntroBlock;
