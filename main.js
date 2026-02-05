import { runFullAnalysis } from "./analysis/index.js";
import {
  getDomRefs,
  setLoadingState,
  showNoTextWarning,
  renderAnalysisResult,
} from "./ui.js";
import { buildHighlightedHtml } from "./highlight.js";

document.addEventListener("DOMContentLoaded", () => {
  const refs = getDomRefs();

  refs.analyzeButton.addEventListener("click", () => {
    const text = refs.textArea.value.trim();
    if (!text) return showNoTextWarning();

    setLoadingState(refs.analyzeButton, true);

    setTimeout(() => {
      const result = runFullAnalysis(text);

      renderAnalysisResult(
        {
          ...result.heuristic,
          aiUnicode: result.aiUnicode,
          highlightedHtml: buildHighlightedHtml(text),
        },
        refs
      );

      setLoadingState(refs.analyzeButton, false);
    }, 50);
  });
});
