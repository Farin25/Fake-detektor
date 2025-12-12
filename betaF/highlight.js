// highlight.js
// Baut aus dem Originaltext eine HTML-Version mit markierten Stellen (Textmarker).

/**
 * Erzeugt hervorgehobenen HTML-Text aus dem Originaltext.
 * Bestimmte Schlüsselwörter werden als <mark>-Elemente mit Klassen versehen.
 */
export function buildHighlightedHtml(rawText) {
  const text = rawText || "";
  if (!text.trim()) return "";

  const lower = text.toLowerCase();

  // Regeln für Hervorhebungen: welche Begriffe bekommen welche "Marker"-Klasse
  const rules = [
    {
      className: "hl-extra",
      weight: 3,
      keywords: [
        "außerirdisch",
        "außerirdische",
        "außerirdischen",
        "alien",
        "aliens",
        "ufo",
        "ufos",
        "raumschiff",
        "raumschiffe",
        "zeitreise",
        "zeitreisen",
        "wunderheilung",
        "wunderheiler",
        "übernatürlich",
        "paranormal",
        "telepathie",
        "geheime superwaffe",
        "geheime waffe",
      ],
    },
    {
      // eher Fake-Warnsignale: reißerisch, feindbildhaft, vage Quellen
      className: "hl-fake",
      weight: 2,
      keywords: [
        "skandal",
        "lüge",
        "lügenpresse",
        "unglaublich",
        "schockierend",
        "endzeit",
        "katastrophe",
        "verschwörung",
        "propaganda",
        "systemmedien",
        "die da oben",
        "elite",
        "volk",
        "verraten",
        "verrat",
        "betrügen",
        "marionetten",
        "volksverräter",
        "böse",
        "feind",
        "man sagt",
        "angeblich",
        "gerüchten zufolge",
        "ich habe gehört",
        "es heißt",
        "viele sagen",
      ],
    },
    {
      // eher Real-Hinweise: Quellen, Institutionen usw.
      className: "hl-real",
      weight: 1,
      keywords: [
        "quelle:",
        "studie",
        "bericht",
        "statistik",
        "bundesamt",
        "institut",
        "universität",
        "forscher",
        "wissenschaftler",
        "daten von",
        "zitiert",
        "berichtete",
        "faktencheck",
        "dpa",
        "reuters",
        "ap news",
        "nasa",
        "esa",
      ],
    },
  ];

  // Alle Treffer (Start/End-Index + Klasse) sammeln
  const matches = [];

  rules.forEach((rule) => {
    rule.keywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      let startIndex = 0;
      while (true) {
        const idx = lower.indexOf(kwLower, startIndex);
        if (idx === -1) break;
        const end = idx + kwLower.length;
        matches.push({
          start: idx,
          end,
          className: rule.className,
          weight: rule.weight,
        });
        startIndex = end;
      }
    });
  });

  if (matches.length === 0) {
    return escapeHtml(text);
  }

  // Matches sortieren und Überlappungen auflösen
  matches.sort((a, b) => {
    if (a.start === b.start) {
      // bei gleichem Start die "wichtigere" (höhere weight) zuerst
      return b.weight - a.weight;
    }
    return a.start - b.start;
  });

  const nonOverlapping = [];
  let currentEnd = 0;

  for (const m of matches) {
    if (m.start >= currentEnd) {
      nonOverlapping.push(m);
      currentEnd = m.end;
    }
  }

  // HTML-String konstruieren
  let result = "";
  let cursor = 0;

  for (const m of nonOverlapping) {
    // Text vor dem markierten Bereich
    if (m.start > cursor) {
      result += escapeHtml(text.slice(cursor, m.start));
    }
    // Markierter Bereich
    const segment = text.slice(m.start, m.end);
    result += `<mark class="${m.className}">${escapeHtml(segment)}</mark>`;
    cursor = m.end;
  }

  // Rest anhängen
  if (cursor < text.length) {
    result += escapeHtml(text.slice(cursor));
  }

  return result;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
