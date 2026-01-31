// backend/src/hf.js

export async function hfAiAssessment({ text }) {
  const token = process.env.HF_TOKEN;
  if (!token) return null;

  // Modell: Fake/Real Klassifikation (funktioniert über hf-inference)
  const MODEL = process.env.HF_MODEL || "jy46604790/Fake-News-Bert-Detect";
  const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL}`;

  // WICHTIG: Viele Transformer-Modelle können max ~512 Tokens.
  // Damit es nicht crasht: Text für KI kürzen (Heuristik bekommt weiter den vollen Text!)
  const MAX_CHARS = 1200;
  const aiText = text.slice(0, MAX_CHARS);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: aiText }),
      signal: controller.signal,
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || data?.error) {
      return {
        error: `hf_${resp.status}`,
        detail: String(data?.error || JSON.stringify(data)).slice(0, 220),
      };
    }

    // HF liefert oft: [{label, score}] oder [[{...}]]
    const arr = Array.isArray(data?.[0]) ? data[0] : data;
    if (!Array.isArray(arr) || !arr[0]) {
      return { error: "hf_parse", detail: JSON.stringify(data).slice(0, 220) };
    }

    const best = arr[0];
    const label = String(best.label || "");
    const score = typeof best.score === "number" ? best.score : 0;

    // Model-Card Mapping: LABEL_0 = Fake, LABEL_1 = Real
    const isFake = /label_0/i.test(label) || /fake/i.test(label);

    // fake_risk: bei Fake -> score*100, bei Real -> (1-score)*100
    const fake_risk_raw = Math.round((isFake ? score : 1 - score) * 100);

    // UX-Kalibrierung: niemals „100% sicher“ anzeigen
    const fake_risk = Math.min(fake_risk_raw, 85);

    return {
      model: MODEL,
      fake_risk,
      summary: isFake
        ? `KI erkennt Muster, die häufig in Falschmeldungen vorkommen (Sicherheit ${Math.round(
            score * 100
          )}%).`
        : `KI erkennt eher Muster seriöser Texte (Sicherheit ${Math.round(
            score * 100
          )}%).`,
      raw: arr.slice(0, 2),
      note: aiText.length < text.length ? "KI analysiert einen Textausschnitt (Modell-Limit)." : "",
    };
  } catch (e) {
    return {
      error: "hf_unavailable",
      detail: String(e?.message || e).slice(0, 220),
    };
  } finally {
    clearTimeout(timeout);
  }
}
