import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { analyzeTextForFakeNews, buildConfidenceHint } from "./src/analysis.js";
import { buildHighlightedHtml } from "./src/highlight.js";
import { hfAiAssessment } from "./src/hf.js";


const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: true }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/api/analyze", async (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const heuristics = analyzeTextForFakeNews(text);

  const ai = await hfAiAssessment({ text });


  res.json({
    ...heuristics,
    confidenceText: buildConfidenceHint(heuristics),
    highlightedHtml: buildHighlightedHtml(text),
    ai, // <- NEU
  });


const aiText = text; // Heuristik bekommt kompletten Text
const [cls, ind] = await Promise.all([
  hfFakeReal({ text: aiText }),
  hfIndicators({ text: aiText })
]);

res.json({
  ...heuristics,
  confidenceText: buildConfidenceHint(heuristics),
  highlightedHtml: buildHighlightedHtml(text),
  ai: {
    classification: cls,
    indicators: ind
  }
});



});
// Frontend ausliefern
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "..");

app.use(express.static(frontendDir));
app.get("/", (req, res) =>
  res.sendFile(path.join(frontendDir, "index.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server läuft auf http://localhost:${PORT}`)
);
