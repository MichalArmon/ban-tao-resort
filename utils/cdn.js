export const cdn = (src, params = "width=1600&fit=cover") =>
  src ? `/.netlify/images?url=${encodeURIComponent(src)}&${params}` : src;
