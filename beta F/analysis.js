// analysis.js
// Enthält die Analyse-Logik, keine DOM-Zugriffe.

/**
 * Führt eine heuristische Analyse eines Textes auf typische Fake-News-Muster durch.
 * Liefert Fake-/Real-Prozentwerte (0–100), Rohscores, Wortanzahl, Flags usw.
 */
export function analyzeTextForFakeNews(rawText) {
  const text = (rawText || "").trim();
  const lower = text.toLowerCase();

  // Für die Wortanalyse: Sonderzeichen raus
  const normalized = text.replace(/[^a-zA-ZÄÖÜäöüß0-9\s]/g, " ");
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let fakeScore = 0;
  let realScore = 0;
  const flags = [];

  // Hilfsfunktion: zählt, wie viele Keywords im Text vorkommen
  function countKeywordHits(haystack, keywords) {
    let hits = 0;
    keywords.forEach((kw) => {
      if (haystack.includes(kw)) hits++;
    });
    return hits;
  }

  // 1. Reißerische / emotionale Schlagwörter
  const sensationalKeywords = [
    "skandal",
    "lüge",
    "lügenpresse",
    "unglaublich",
    "schockierend",
    "schock!",
    "hammer",
    "eskaliert",
    "endzeit",
    "katastrophe",
    "geheimnis",
    "verschwörung",
    "propaganda",
    "systemmedien",
    "was dir niemand sagt",
    "die wahrheit über",
    "wird dir nicht gefallen",
    "muss man gesehen haben",
    "für immer verändern",
  ];

  const sensationalHits = countKeywordHits(lower, sensationalKeywords);
  if (sensationalHits > 0) {
    const points = Math.min(20, sensationalHits * 4);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Reißerische oder stark emotionale Sprache erkannt (${sensationalHits} Treffer).`,
    });
  }

  // 2. Viele Ausrufezeichen
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations >= 3) {
    const points = Math.min(15, exclamations * 2);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Viele Ausrufezeichen (${exclamations}) – kann auf emotionalisierte Inhalte hinweisen.`,
    });
  }

  // 3. Kombinationen ?! oder !?
  const comboPunct = (text.match(/\?!|!\?/g) || []).length;
  if (comboPunct >= 1) {
    const points = Math.min(8, comboPunct * 3);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Kombinationen wie „?!“ entdeckt (${comboPunct} Treffer). Deuten auf starke Emotionalisierung hin.`,
    });
  }

  // 4. CAPSLOCK-Wörter (mindestens 4 Zeichen)
  const capsWords = words.filter((w) => {
    const cleaned = w.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
    return cleaned.length >= 4 && cleaned === cleaned.toUpperCase();
  });

  if (capsWords.length >= 3) {
    const points = Math.min(15, capsWords.length * 2);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Viele komplett großgeschriebene Wörter entdeckt (${capsWords.length} Treffer). Das kann auf Übertreibung hinweisen.`,
    });
  }

  // 5. Polarisierende / Feindbildsprache
  const polarizingKeywords = [
    "die da oben",
    "elite",
    "volk",
    "verraten",
    "verrat",
    "betrügen",
    "marionetten",
    "system",
    "schuld",
    "volksverräter",
    "böse",
    "feind",
  ];
  const polarHits = countKeywordHits(lower, polarizingKeywords);
  if (polarHits > 0) {
    const points = Math.min(15, polarHits * 3);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Stark feindbildhafte Sprache gefunden (${polarHits} Begriffe).`,
    });
  }

  // 6. Vage Quellenangaben (wirken unseriös)
  const vagueSourcePatterns = [
    "man sagt",
    "angeblich",
    "gerüchten zufolge",
    "ich habe gehört",
    "es heißt",
    "viele sagen",
  ];
  const vagueHits = countKeywordHits(lower, vagueSourcePatterns);
  if (vagueHits > 0) {
    const points = Math.min(12, vagueHits * 4);
    fakeScore += points;
    flags.push({
      type: "fake",
      message: `Vage oder unklare Quellenangaben erkannt (${vagueHits} Treffer) – kein klarer Nachweis.`,
    });
  }

  // 7. Fehlende Struktur / extrem kurze Texte
  if (wordCount > 0 && wordCount < 25) {
    fakeScore += 8;
    flags.push({
      type: "fake",
      message: "Sehr kurzer Text – wenig Informationen können leicht irreführend sein.",
    });
  }

  // 8. Seriöse Indikatoren: Quellen, Daten, Nüchternheit
  const sourceIndicators = [
    "quelle:",
    "laut ",
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
  ];

  const sourceHits = countKeywordHits(lower, sourceIndicators);
  if (sourceHits > 0) {
    const points = Math.min(10, sourceHits * 2.5); // 🔧 vorher 18 – jetzt deutlich reduziert
    realScore += points;
    flags.push({
      type: "real",
      message: `Hinweise auf Quellen oder institutionelle Angaben gefunden (${sourceHits} Treffer).`,
    });
  }

  // 9. Zahlen und Daten (leicht positiv, aber schwach)
  const numberMatches = text.match(/\d{2,4}/g) || [];
  if (numberMatches.length > 0) {
    const points = Math.min(6, numberMatches.length * 1.0); // 🔧 vorher 10 – abgeschwächt
    realScore += points;
    flags.push({
      type: "real",
      message: `Zahlen oder Daten im Text erkannt (${numberMatches.length} Treffer). Das kann auf eine sachliche Darstellung hindeuten – muss aber nicht.`,
    });
  }

  // 10. Links / URLs (minimal positiv gewertet)
  const urlMatches = text.match(/https?:\/\/[^\s]+/g) || [];
  if (urlMatches.length > 0) {
    realScore += 2; // 🔧 vorher 4
    flags.push({
      type: "real",
      message: "Es wurden Links oder URLs gefunden – das kann auf weiterführende Quellen hinweisen.",
    });
  }

  // 11. Nüchterne Sprache – wenig Ausrufezeichen, kaum CAPS
  if (wordCount > 0 && exclamations === 0 && capsWords.length <= 1) {
    realScore += 5; // 🔧 vorher 8
    flags.push({
      type: "real",
      message: "Wenig oder keine Ausrufezeichen und kaum komplett großgeschriebene Wörter – wirkt eher nüchtern.",
    });
  }

  // 12. Umfangreicher Text
  if (wordCount > 200) {
    realScore += 3; // 🔧 vorher 5
    flags.push({
      type: "real",
      message: "Längerer Text mit mehr Kontext – kann auf ausführliche Berichterstattung hinweisen.",
    });
  }

  // 13. Clickbait-Muster in der Überschrift (erste Zeile)
  const firstLine = text.split(/\n/)[0].toLowerCase();
  const clickbaitPatterns = [
    "krass",
    "unglaublich",
    "mindblowing",
    "kaum zu glauben",
    "sprachlos",
  ];
  const clickbaitHit = clickbaitPatterns.some((p) => firstLine.includes(p));
  if (clickbaitHit) {
    fakeScore += 12;
    flags.push({
      type: "fake",
      message: "Auffällige Wörter in der Überschrift, die auf Clickbait hindeuten können.",
    });
  }

  /**
   * 14. Außergewöhnliche Behauptungen / Themen
   * z.B. Aliens, Wunderheilung, Zeitreise, Übernatürliches.
   * -> sollen das Ergebnis in Richtung „unsicher / kritisch“ schieben,
   *    auch wenn der Stil seriös ist.
   */
  const extraordinaryKeywords = [
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
  ];

  const extraordinaryHits = countKeywordHits(lower, extraordinaryKeywords);
  const hasExtraordinaryClaims = extraordinaryHits > 0;

  if (hasExtraordinaryClaims) {
    // Deutlich Fake-Punkte hinzufügen
    const extraFake = Math.min(24, extraordinaryHits * 7); // 🔧 etwas stärker
    fakeScore += extraFake;

    // Und einen Teil des Real-Scores dämpfen
    const penalty = Math.min(realScore * 0.6, extraordinaryHits * 6); // 🔧 stärkere Dämpfung
    realScore -= penalty;

    flags.push({
      type: "fake",
      message:
        "Der Text enthält außergewöhnliche oder sehr spektakuläre Behauptungen (z. B. Aliens, Übernatürliches). Bei solchen Themen ist besondere Vorsicht geboten.",
    });
  }

  // 15. Kontext: starke Fake-Signale → Real nicht dominieren lassen
  const strongFakeContext =
    hasExtraordinaryClaims ||
    sensationalHits >= 2 ||
    polarHits >= 1 ||
    exclamations >= 5;

  if (strongFakeContext && realScore > fakeScore * 0.6) {
    // 🔧 Real darf in stark „fakeigen“ Kontexten nicht deutlich drüber liegen
    realScore = fakeScore * 0.6;
  }

  // --- Neue Normalisierung / Kombination ---
  // Statt fakeScore - realScore → Verhältnis von "Evidenz"
  let fakeEvidence = 1 + fakeScore; // +1, damit nie 0
  let realEvidence = 1 + realScore;

  // Wenn starker Fake-Kontext, Real-Evidenz noch etwas bremsen
  if (strongFakeContext && realEvidence > fakeEvidence * 0.8) {
    realEvidence = fakeEvidence * 0.8;
  }

  const totalEvidence = fakeEvidence + realEvidence;

  let fakePercent;
  let realPercent;

  if (totalEvidence <= 0) {
    fakePercent = 50;
    realPercent = 50;
  } else {
    fakePercent = Math.round((fakeEvidence / totalEvidence) * 100);
    realPercent = 100 - fakePercent;
  }

  // Sicherheitshalber clampen
  fakePercent = Math.max(0, Math.min(100, fakePercent));
  realPercent = Math.max(0, Math.min(100, realPercent));

  return {
    fakePercent,
    realPercent,
    fakeScore,
    realScore,
    wordCount,
    flags,
    hasExtraordinaryClaims,
  };
}

/**
 * Baut den erklärenden Hinweistext zum Ergebnis (Tendenz + Disclaimer).
 */
export function buildConfidenceHint(analysis) {
  const { fakePercent, wordCount, hasExtraordinaryClaims } = analysis;

  let tendency;
  if (fakePercent > 70) {
    tendency =
      "Der Text wirkt stark unseriös. Am besten genauer prüfen und sehr vorsichtig beim Teilen sein.";
  } else if (fakePercent > 55) {
    tendency =
      "Der Text zeigt mehrere Auffälligkeiten. Kritisch bleiben und die Informationen sorgfältig prüfen.";
  } else if (fakePercent < 30) {
    tendency =
      "Der Text wirkt eher vertrauenswürdig. Trotzdem immer kritisch bleiben und nicht blind vertrauen.";
  } else {
    tendency =
      "Der Text liegt im mittleren Bereich. Hier ist eine genaue Prüfung und zusätzliche Recherche besonders wichtig.";
  }

  let extraNote = "";
  if (hasExtraordinaryClaims) {
    extraNote =
      " Der Text enthält außergewöhnliche oder spektakuläre Behauptungen. Für solche Themen gilt besonders: Außergewöhnliche Behauptungen brauchen außergewöhnlich gute Belege.";
  }

  let lengthNote = "";
  if (wordCount > 0 && wordCount < 40) {
    lengthNote =
      " Hinweis: Sehr kurze Texte können nur eingeschränkt zuverlässig analysiert werden.";
  }

  const baseText =
    " Das Ergebnis ist nur eine heuristische Einschätzung und ersetzt weder gründliche Recherche noch gesunden Menschenverstand.";

  return `${tendency}${extraNote}${baseText}${lengthNote}`;
}
