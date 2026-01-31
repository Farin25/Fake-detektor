console.log("Detector script loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("articleText");
  const button = document.getElementById("analyzeButton");

  const noResultHint = document.getElementById("noResultHint");
  const resultContent = document.getElementById("resultContent");
  const fakePercentEl = document.getElementById("fakePercent");
  const realPercentEl = document.getElementById("realPercent");
  const fakeBar = document.getElementById("fakeBar");
  const realBar = document.getElementById("realBar");
  const flagsList = document.getElementById("flagsList");
  const confidenceHint = document.getElementById("confidenceHint");
  const articlePreview = document.getElementById("articlePreview");

  // Loading UI (optional – falls du es eingebaut hast)
  const loadingBox = document.getElementById("loadingBox");
  const loadingText = document.getElementById("loadingText");
  const progressBar = document.getElementById("progressBar");
  const progressPct = document.getElementById("progressPct");

  // AI UI (optional – falls du es eingebaut hast)
  const aiBox = document.getElementById("aiBox");
  const aiSummary = document.getElementById("aiSummary");
  const aiReasons = document.getElementById("aiReasons");

  if (!textarea || !button) {
    console.warn("Textarea oder Button nicht gefunden");
    return;
  }

  button.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) {
      alert("Bitte zuerst einen Text eingeben.");
      return;
    }

    button.disabled = true;
    button.textContent = "Analysiere…";

    // Ladebalken starten
    let pct = 0;
    let timer = null;

    if (loadingBox && loadingText && progressBar && progressPct) {
      loadingBox.classList.remove("hidden");
      loadingText.textContent = "Text wird analysiert…";
      progressBar.style.width = "0%";
      progressPct.textContent = "0%";

      timer = setInterval(() => {
        if (pct < 85) pct += Math.random() * 8;
        if (pct > 85) pct = 85;
        progressBar.style.width = `${Math.floor(pct)}%`;
        progressPct.textContent = `${Math.floor(pct)}%`;
      }, 200);
    }

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) throw new Error(`API Fehler (${resp.status})`);

      const data = await resp.json();
      console.log("API result:", data);

      // Ergebnis anzeigen
      noResultHint?.classList.add("hidden");
      resultContent?.classList.remove("hidden");

      fakePercentEl.textContent = `${data.fakePercent}%`;
      realPercentEl.textContent = `${data.realPercent}%`;

      fakeBar.style.width = `${data.fakePercent}%`;
      realBar.style.width = `${data.realPercent}%`;

      // Flags rendern
      flagsList.innerHTML = "";
      if (!data.flags || data.flags.length === 0) {
        flagsList.innerHTML = `<li class="real-flag">
          <span class="flag-pill-label">Hinweis</span>
          <span>Keine Auffälligkeiten erkannt.</span>
        </li>`;
      } else {
        data.flags.forEach((flag) => {
          const li = document.createElement("li");
          li.className = flag.type === "fake" ? "fake-flag" : "real-flag";
          li.innerHTML = `
            <span class="flag-pill-label">${flag.type === "fake" ? "Warnsignal" : "Seriös"}</span>
            <span>${flag.message}</span>`;
          flagsList.appendChild(li);
        });
      }

      confidenceHint.textContent = data.confidenceText || "";
      articlePreview.innerHTML = data.highlightedHtml || "";

      // KI anzeigen (wenn Box existiert)
      if (aiBox && aiSummary && aiReasons) {
        aiBox.classList.remove("hidden");
        aiReasons.innerHTML = "";

        if (data.ai && !data.ai.error) {
          const risk =
            typeof data.ai.fake_risk === "number" ? `${data.ai.fake_risk}/100 — ` : "";
          const note = data.ai.note ? ` (${data.ai.note})` : "";

          aiSummary.textContent = `${risk}${data.ai.summary || "KI-Auswertung verfügbar."}${note}`;

          // Optional: raw Labels anzeigen
          if (Array.isArray(data.ai.raw)) {
            data.ai.raw.forEach((x) => {
              const li = document.createElement("li");
              const pct = Math.round((x.score || 0) * 100);
              li.textContent = `${x.label}: ${pct}%`;
              aiReasons.appendChild(li);
            });
          }
        } else {
          const code = data.ai?.error ? `(${data.ai.error}) ` : "";
          const detail = data.ai?.detail ? `– ${data.ai.detail}` : "";
          aiSummary.textContent = `KI aktuell nicht verfügbar ${code}${detail}`;
        }
      }
    } catch (err) {
      console.error(err);
      alert("Fehler bei der Analyse");
    } finally {
      // Ladebalken sauber beenden
      if (loadingBox && loadingText && progressBar && progressPct) {
        if (timer) clearInterval(timer);
        progressBar.style.width = "100%";
        progressPct.textContent = "100%";
        loadingText.textContent = "Fertig!";
        setTimeout(() => loadingBox.classList.add("hidden"), 400);
      }

      button.disabled = false;
      button.textContent = "Prüfen";
    }
  });
});
