function InvestorsMainPage() {
  return (
    <>
      {" "}
      כפתור שיחה צף בפינה
      <Fab
        aria-label="Call"
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          bgcolor: "#fff",
          color: "primary.main",
          border: "2px solid",
          borderColor: "primary.main",
          "&:hover": { bgcolor: "#fff" },
        }}
      >
        <Phone />
      </Fab>
      <PublicNav />
      <Hero />
      <IntroBlock />
      <TwoImageGrid />
      <FullScreenImage src="/landsccape2.jpg" navH={72} durationVH={100} />
      <Pblock
        title="THOUGHTFUL DESIGN INSIDE AND OUT"
        text="SOL LIVING | PHANGAN sets a new standard for design . Every element of your villa has been meticulously crafted to combine beauty with functionality ."
        align="left"
      />
      <Button component={RouterLink} to="/about">
        try
      </Button>
      <TwinImages />
      <FullScreenImage src="/landscape3.jpg" navH={72} durationVH={220} />
    </>
  );
}

export default InvestorsMainPage;
