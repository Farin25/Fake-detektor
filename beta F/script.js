// FakeDetector – reine Client-Side-Heuristik, kein echter Faktencheck

document.addEventListener("DOMContentLoaded", () => {
  const textArea = document.getElementById("articleText");
  const analyzeButton = document.getElementById("analyzeButton");
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");

  const noResultHint = document.getElementById("noResultHint");
  const resultContent = document.getElementById("resultContent");

  const fakePercentEl = document.getElementById("fakePercent");
  const realPercentEl = document.getElementById("realPercent");
  const fakeBar = document.getElementById("fakeBar");
  const realBar = document.getElementById("realBar");
  const flagsList = document.getElementById("flagsList");
  const confidenceHint = document.getElementById("confidenceHint");

  // Bild-Vorschau (nur Anzeige, keine Analyse)
  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      imagePreview.src = "";
      imagePreview.style.display = "none";
      showImagePlaceholder(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      imagePreview.style.display = "block";
      showImagePlaceholder(false);
    };
    reader.readAsDataURL(file);
  });

  function showImagePlaceholder(show) {
    const placeholder = imagePreviewContainer.querySelector(".image-placeholder");
    if (placeholder) {
      placeholder.style.display = show ? "block" : "none";
    }
  }

  // Button-Click: Text analysieren
  analyzeButton.addEventListener("click", () => {
    const text = (textArea.value || "").trim();
    if (!text) {
      alert("Bitte zuerst einen Text einfügen.");
      return;
    }

    const analysis = analyzeTextForFakeNews(text);

    // Ergebnis in UI schreiben
    noResultHint.classList.add("hidden");
    resultContent.classList.remove("hidden");

    fakePercentEl.textContent = `${analysis.fakePercent}%`;
    realPercentEl.textContent = `${analysis.realPercent}%`;

    fakeBar.style.width = `${analysis.fakePercent}%`;
    realBar.style.width = `${analysis.realPercent}%`;

    // Flags-Liste rendern
    flagsList.innerHTML = "";
    if (analysis.flags.length === 0) {
      const li = document.createElement("li");
      li.className = "real-flag";
      li.innerHTML =
        '<span class="flag-pill-label">Hinweis</span><span>Keine besonderen Auffälligkeiten erkannt. Trotzdem kritisch bleiben.</span>';
      flagsList.appendChild(li);
    } else {
      analysis.flags.forEach((flag) => {
        const li = document.createElement("li");
        li.className = flag.type === "fake" ? "fake-flag" : "real-flag";
        const label = flag.type === "fake" ? "Warnsignal" : "Seriös-Hinweis";
        li.innerHTML = `
          <span class="flag-pill-label">${label}</span>
          <span>${flag.message}</span>
        `;
        flagsList.appendChild(li);
      });
    }

    confidenceHint.textContent = buildConfidenceHint(analysis);
  });

  /**
   * Kernlogik: heuristische Analyse eines Textes.
   * Gibt Fake-/Real-Prozent (0–100) + Liste von Hinweisen zurück.
   */
  function analyzeTextForFakeNews(text) {
    const lower = text.toLowerCase();
    const length = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    let fakeScore = 0;
    let realScore = 0;
    const flags = [];

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

    let sensationalHits = 0;
    sensationalKeywords.forEach((kw) => {
      if (lower.includes(kw)) {
        sensationalHits++;
      }
    });

    if (sensationalHits > 0) {
      const points = Math.min(20, sensationalHits * 4);
      fakeScore += points;
      flags.push({
        type: "fake",
        message: `Reißerische Sprache erkannt (${sensationalHits} typische Schlagwort(e)).`,
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

    // 3. CAPSLOCK-Wörter (mindestens 4 Zeichen)
    const words = text.split(/\s+/);
    const capsWords = words.filter((w) => {
      const cleaned = w.replace(/[^A-Za-zÄÖÜäöüß]/g, "");
      return cleaned.length >= 4 && cleaned === cleaned.toUpperCase();
    });

    if (capsWords.length >= 3) {
      const points = Math.min(15, capsWords.length * 2);
      fakeScore += points;
      flags.push({
        type: "fake",
        message: `Viele komplett großgeschriebene Wörter (${capsWords.length}) – mögliches Anzeichen für Clickbait.`,
      });
    }

    // 4. Starke Polarisierung / Feindbildsprache
    const polarizingKeywords = [
      "die da oben",
      "elite",
      "volk",
      "verraten",
      "verrat",
      "lügen",
      "betrügen",
      "marionetten",
      "system",
      "schuld",
      "volksverräter",
      "böse",
    ];
    let polarHits = 0;
    polarizingKeywords.forEach((kw) => {
      if (lower.includes(kw)) polarHits++;
    });
    if (polarHits > 0) {
      const points = Math.min(15, polarHits * 3);
      fakeScore += points;
      flags.push({
        type: "fake",
        message: `Stark polarisierende Sprache (${polarHits} Begriff(e)) entdeckt.`,
      });
    }

    // 5. Fehlende Struktur / extrem kurz
    if (wordCount < 25) {
      fakeScore += 8;
      flags.push({
        type: "fake",
        message:
          "Sehr kurzer Text – Schlagzeilen ohne Kontext sind oft irreführend.",
      });
    }

    // 6. Seriöse Indikatoren: Quellen, Daten, Nüchternheit
    const sourceIndicators = [
      "quelle:",
      "laut",
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
    ];

    let sourceHits = 0;
    sourceIndicators.forEach((kw) => {
      if (lower.includes(kw)) sourceHits++;
    });

    if (sourceHits > 0) {
      const points = Math.min(20, sourceHits * 4);
      realScore += points;
      flags.push({
        type: "real",
        message: `Hinweise auf Quellen / Studien (${sourceHits} Treffer) gefunden.`,
      });
    }

    // 7. Zahlen und Daten (wir werten das leicht positiv)
    const numberMatches = text.match(/\d{2,4}/g) || [];
    if (numberMatches.length > 0) {
      const points = Math.min(10, numberMatches.length * 1.5);
      realScore += points;
      flags.push({
        type: "real",
        message: `Zahlen / Daten im Text erkannt (${numberMatches.length}). Das kann auf eine sachliche Darstellung hindeuten – muss aber nicht.`,
      });
    }

    // 8. Sachlichere Sprache – wenig Ausrufezeichen, kaum CAPS
    if (exclamations === 0 && capsWords.length <= 1) {
      realScore += 8;
      flags.push({
        type: "real",
        message:
          "Wenig bis keine Ausrufezeichen und kaum Großschreibung – wirkt sprachlich eher nüchtern.",
      });
    }

    // 9. Umfangreicher Text
    if (wordCount > 200) {
      realScore += 5;
      flags.push({
        type: "real",
        message:
          "Relativ langer Text – längere Berichte sind eher Kontext-basiert (können aber trotzdem Falschinformationen enthalten).",
      });
    }

    // 10. Clickbait-Muster in Überschrift
    const firstLine = text.split(/\n/)[0].toLowerCase();
    const clickbaitPatterns = [
      "du wirst nicht glauben",
      "nummer 3 wird dich schockieren",
      "was dann passierte",
      "so etwas hast du noch nie gesehen",
    ];
    let clickbaitHit = clickbaitPatterns.some((p) => firstLine.includes(p));
    if (clickbaitHit) {
      fakeScore += 12;
      flags.push({
        type: "fake",
        message:
          "Typisches Clickbait-Muster in der Überschrift erkannt („Du wirst nicht glauben…“ etc.).",
      });
    }

    // Score-Normalisierung
    // Basis 50/50, Fake erhöht fakeScore, Real erhöht realScore.
    let combinedScore = fakeScore - realScore; // >0 = eher Fake, <0 = eher real
    // Begrenzen, damit es nicht völlig eskaliert
    combinedScore = Math.max(-40, Math.min(40, combinedScore));

    let fakePercent = Math.round(50 + combinedScore);
    let realPercent = 100 - fakePercent;

    fakePercent = Math.max(0, Math.min(100, fakePercent));
    realPercent = Math.max(0, Math.min(100, realPercent));

    return {
      fakePercent,
      realPercent,
      fakeScore,
      realScore,
      wordCount,
      flags,
    };
  }

  function buildConfidenceHint(analysis) {
    const { fakePercent, wordCount } = analysis;

    let baseText =
      "Das Ergebnis ist nur eine heuristische Einschätzung und ersetzt keinen Faktencheck.";

    let tendency;
    if (fakePercent > 70) {
      tendency =
        "Der Text zeigt mehrere starke Warnsignale. Besonders kritisch prüfen und weitere Quellen heranziehen.";
    } else if (fakePercent > 55) {
      tendency =
        "Der Text wirkt in Teilen reißerisch oder auffällig. Mit Vorsicht genießen und Fakten nachprüfen.";
    } else if (fakePercent < 30) {
      tendency =
        "Der Text wirkt sprachlich eher seriös. Trotzdem können Inhalte falsch oder verzerrt sein – bitte weiterhin kritisch bleiben.";
    } else {
      tendency =
        "Der Text liegt im mittleren Bereich – weder klar unauffällig noch extrem reißerisch. Kontext und externe Quellen sind hier besonders wichtig.";
    }

    let lengthNote = "";
    if (wordCount < 40) {
      lengthNote =
        " Hinweis: Sehr kurze Texte (nur Überschrift oder ein Satz) lassen sich nur schwer zuverlässig einschätzen.";
    }

    return `${tendency} ${baseText}${lengthNote}`;
  }
});
