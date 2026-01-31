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

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!resp.ok) {
        throw new Error("API Fehler");
      }

      const data = await resp.json();
      console.log("API result:", data);

      // UI anzeigen
      noResultHint.classList.add("hidden");
      resultContent.classList.remove("hidden");

      fakePercentEl.textContent = `${data.fakePercent}%`;
      realPercentEl.textContent = `${data.realPercent}%`;

      fakeBar.style.width = `${data.fakePercent}%`;
      realBar.style.width = `${data.realPercent}%`;

      flagsList.innerHTML = "";
      if (!data.flags || data.flags.length === 0) {
        flagsList.innerHTML = `<li class="real-flag">
          <span class="flag-pill-label">Hinweis</span>
          <span>Keine Auffälligkeiten erkannt.</span>
        </li>`;
      } else {
        data.flags.forEach(flag => {
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

    } catch (err) {
      console.error(err);
      alert("Fehler bei der Analyse");
    } finally {
      button.disabled = false;
      button.textContent = "Prüfen";
    }
  });
});
