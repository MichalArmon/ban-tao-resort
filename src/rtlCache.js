import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

const isRtl = false; // אם האתר בעברית
export default createCache({
  key: isRtl ? "muirtl" : "mui",
  stylisPlugins: isRtl ? [rtlPlugin] : [],
});
