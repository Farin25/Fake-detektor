import { analyzeTextForFakeNews } from "./heuristics.js";
import { detectAiUnicode } from "./aiUnicode.js";

export function runFullAnalysis(text) {
  return {
    heuristic: analyzeTextForFakeNews(text),
    aiUnicode: detectAiUnicode(text),
    aiAnalysis: { status: "coming_soon" },
  };
}
