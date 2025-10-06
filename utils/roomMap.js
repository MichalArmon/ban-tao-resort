export function toSlug(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// מנסה: 1) התאמה ישירה לפי slug,
//       2) לפי title/label בקטלוג,
//       3) לפי slugify של השם מהשרת.
export function findRoomSlug(roomsCatalog, serverName = "") {
  const catalogEntries = Object.entries(roomsCatalog || {});
  const slugFromName = toSlug(serverName);

  // חיפוש לפי slug קיים
  if (roomsCatalog[slugFromName]) return slugFromName;

  // חיפוש לפי title/label
  const match = catalogEntries.find(([slug, data]) => {
    const t = (data?.title || data?.label || "").toLowerCase().trim();
    return t === serverName.toLowerCase().trim();
  });
  if (match) return match[0];

  // כבר ניסינו slugify; אם אין – תחזיר null
  return null;
}
