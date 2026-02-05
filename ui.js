// ui.js

/**
 * DOM-Referenzen
 */
export function getDomRefs() {
  return {
    textArea: document.getElementById("articleText"),
    analyzeButton: document.getElementById("analyzeButton"),
    noResultHint: document.getElementById("noResultHint"),
    resultContent: document.getElementById("resultContent"),
    fakePercentEl: document.getElementById("fakePercent"),
    realPercentEl: document.getElementById("realPercent"),
    fakeBar: document.getElementById("fakeBar"),
    realBar: document.getElementById("realBar"),
    flagsList: document.getElementById("flagsList"),
    confidenceHint: document.getElementById("confidenceHint"),
    articlePreview: document.getElementById("articlePreview"), // WICHTIG
  };
}

/**
 * Button Ladezustand
 */
export function setLoadingState(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? "Analysiere..." : "Artikel prüfen";
}

/**
 * Warnung
 */
export function showNoTextWarning() {
  alert("Bitte zuerst einen Text einfügen.");
}

/**
 * Ergebnis rendern
 */
export function renderAnalysisResult(analysis, refs) {
  const {
    noResultHint,
    resultContent,
    fakePercentEl,
    realPercentEl,
    fakeBar,
    realBar,
    flagsList,
    confidenceHint,
    articlePreview,
  } = refs;

  if (noResultHint) noResultHint.classList.add("hidden");
  if (resultContent) resultContent.classList.remove("hidden");

  // Prozentwerte
  fakePercentEl.textContent = `${analysis.fakePercent}%`;
  realPercentEl.textContent = `${analysis.realPercent}%`;

  // Balken
  fakeBar.style.width = `${analysis.fakePercent}%`;
  realBar.style.width = `${analysis.realPercent}%`;

  // Flags
  flagsList.innerHTML = "";
  if (!analysis.flags || analysis.flags.length === 0) {
    const li = document.createElement("li");
    li.className = "real-flag";
    li.innerHTML =
      '<span class="flag-pill-label">Hinweis</span><span>Keine Auffälligkeiten erkannt.</span>';
    flagsList.appendChild(li);
  } else {
    analysis.flags.forEach((flag) => {
      const li = document.createElement("li");
      li.className = flag.type === "fake" ? "fake-flag" : "real-flag";
      const label = flag.type === "fake" ? "Warnsignal" : "Seriös-Hinweis";
      li.innerHTML = `
        <span class="flag-pill-label">${label}</span>
        <span>${flag.message}</span>`;
      flagsList.appendChild(li);
    });
  }

  // Confidence Text
  confidenceHint.textContent = analysis.confidenceText || "";

  // HIGHLIGHTED ARTICLE PREVIEW
  if (articlePreview) {
    articlePreview.innerHTML = analysis.highlightedHtml || "";
  }

   if (analysis.aiUnicode) {
    const { isLikelyAi, count } = analysis.aiUnicode;

    const li = document.createElement("li");
    li.className = isLikelyAi ? "fake-flag" : "real-flag";
    li.innerHTML = `
      <span class="flag-pill-label">AI-Detektor</span>
      <span>
        ${isLikelyAi
          ? `Verdächtige Unicode-Zeichen gefunden (${count})`
          : "Keine typischen AI-Unicode-Merkmale gefunden"}
      </span>`;
    flagsList.appendChild(li);
  }
}

