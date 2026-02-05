// Prüft auf verdächtige Unicode-Zeichen
export function detectAiUnicode(text) {
  const suspiciousChars = [
    "\u202F", // Narrow No-Break Space
    "\u200B", // Zero Width Space
    "\u2060", // Word Joiner
    "\u00A0", // No-Break Space
    "\u200C", // Zero Width Non-Joiner
    "\u200D", // Zero Width Joiner
    "\u2061",
    "\u2062",
    "\u2063",
    "\u2064",
    "\uFEFF", // BOM
    "\u2013", // Gedankenstrich (EN Dash)
  ];

  const found = suspiciousChars.filter(char => text.includes(char));

  return {
    isLikelyAi: found.length > 0,
    foundChars: found,
    count: found.length,
  };
}
