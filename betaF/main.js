// main.js
import { analyzeTextForFakeNews, buildConfidenceHint } from "./analysis.js";
import {
  getDomRefs,
  setLoadingState,
  showNoTextWarning,
  renderAnalysisResult,
} from "./ui.js";
import { buildHighlightedHtml } from "./highlight.js"; // WICHTIG

document.addEventListener("DOMContentLoaded", () => {
  const refs = getDomRefs();

  if (!refs.analyzeButton) {
    console.warn("analyzeButton nicht gefunden – bitte HTML prüfen.");
    return;
  }

  refs.analyzeButton.addEventListener("click", () => {
    const text = (refs.textArea?.value || "").trim();

    if (!text) {
      showNoTextWarning();
      return;
    }

    setLoadingState(refs.analyzeButton, true);

    setTimeout(() => {
      const analysis = analyzeTextForFakeNews(text);
      const confidenceText = buildConfidenceHint(analysis);

      // HIGHLIGHTED HTML erzeugen
      const highlightedHtml = buildHighlightedHtml(text);

      renderAnalysisResult(
        {
          ...analysis,
          confidenceText,
          highlightedHtml, // WICHTIG
        },
        refs
      );

      setLoadingState(refs.analyzeButton, false);
    }, 50);
  });
});
