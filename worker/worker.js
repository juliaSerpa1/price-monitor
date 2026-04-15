const { Worker } = require("bullmq");
const puppeteer = require("puppeteer");
const { extractPriceAI } = require("./ai-extractor");

console.log("🚀 Worker iniciado...");

const API_URL = "http://localhost:3000";

function parsePrice(raw) {
  if (!raw) return null;

  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  if (cleaned.includes(",")) {
    return parseFloat(
      cleaned.replace(/\./g, "").replace(",", ".")
    );
  }

  return parseFloat(cleaned);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const worker = new Worker(
  "scrape",
  async (job) => {
    const { targetId } = job.data;

    let browser;

    try {
      await job.updateProgress(5);

      console.log("🔥 Iniciando job:", targetId);

      const res = await fetch(`${API_URL}/targets/${targetId}`);
      const target = await res.json();

      if (!target) return;

      await job.updateProgress(10);

      console.log("🌐 Scraping:", target.name);

      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      // 🔥 USER AGENT ROTATIVO
      const USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Version/15 Mobile Safari/604.1",
      ];

      const ua =
        USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      await page.setUserAgent(ua);

      await page.setExtraHTTPHeaders({
        "accept-language": "pt-BR,pt;q=0.9",
      });

      // =========================
      // 🔥 1. INTERCEPTAR API (CONTROLADO)
      // =========================
      let apiPrice = null;
      let apiResolved = false;

      page.on("response", async (response) => {
        if (apiResolved) return;

        try {
          const url = response.url();

          if (
            url.includes("price") ||
            url.includes("product") ||
            url.includes("offer")
          ) {
            const data = await response.json();

            const str = JSON.stringify(data);
            const match = str.match(/"price":\s?(\d+\.?\d*)/);

            if (match) {
              apiPrice = parseFloat(match[1]);
              apiResolved = true;

              console.log("🔥 Preço via API:", apiPrice);
            }
          }
        } catch { }
      });

      await page.goto(target.url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      await job.updateProgress(40);

      await delay(3000);

      // =========================
      // 🔥 2. JSON INTERNO
      // =========================
      let jsonPrice = await page.evaluate(() => {
        try {
          const data = window.__NEXT_DATA__;
          if (!data) return null;

          const str = JSON.stringify(data);
          const match = str.match(/"price":\s?(\d+\.?\d*)/);

          return match ? parseFloat(match[1]) : null;
        } catch {
          return null;
        }
      });

      if (jsonPrice) {
        console.log("🧠 Preço via JSON:", jsonPrice);
      }

      await job.updateProgress(70);

      // =========================
      // 🔥 3. DOM INTELIGENTE (LIMITADO)
      // =========================
      const domRaw = await page.evaluate(() => {
        function isVisible(el) {
          const style = window.getComputedStyle(el);
          return (
            style &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            el.offsetHeight > 0
          );
        }

        function extractPrice(text) {
          if (!text) return null;

          const match = text.match(/R\$\s?\d{1,3}(\.\d{3})*,\d{2}/);
          return match ? match[0] : null;
        }

        const elements = [
          ...document.querySelectorAll("body *:not(script):not(style)")
        ].slice(0, 2000); // 🔥 evita travamento

        let best = null;

        for (const el of elements) {
          if (!isVisible(el)) continue;

          const text = el.innerText;
          if (!text) continue;

          if (text.includes("x de") || text.includes("sem juros")) continue;

          const price = extractPrice(text);
          if (!price) continue;

          const numericValue = parseFloat(
            price.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "")
          );

          let score = numericValue;

          if (/^R\$\s?\d/.test(text.trim())) score += 10000;

          score -= text.length;

          if (!best || score > best.score) {
            best = { price, score };
          }
        }

        return best ? best.price : null;
      });

      await job.updateProgress(90);

      // =========================
      // 🔥 DECISÃO FINAL (DECLARAR ANTES)
      // =========================
      let finalPrice = null;

      if (apiPrice) finalPrice = apiPrice;
      else if (jsonPrice) finalPrice = jsonPrice;
      else if (domRaw) finalPrice = parsePrice(domRaw);

      // =========================
      // 🔥 FALLBACK IA
      // =========================
      let aiPrice = null;

      if (!finalPrice) {
        console.log("🤖 Tentando via IA...");

        const html = await page.content();

        const ai = await extractPriceAI(html);

        if (ai?.price) {
          aiPrice = ai.price;
        }
      }

      // decisão final com IA
      if (!finalPrice && aiPrice) {
        finalPrice = aiPrice;
      }

      console.log("💵 Preço final:", finalPrice);

      await fetch(`${API_URL}/targets/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          price: finalPrice,
        }),
      });

      await job.updateProgress(100);

    } catch (err) {
      console.error("❌ Erro geral:", err.message);
    } finally {
      if (browser) await browser.close();
    }
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },

    // 🔥 CONFIG ANTI-STALLED
    lockDuration: 120000,
    stalledInterval: 60000,
    maxStalledCount: 2,
  }
);

// eventos
worker.on("ready", () => console.log("🟢 Worker pronto"));
worker.on("active", (job) => console.log("⚙️ Processando:", job.id));
worker.on("completed", (job) => console.log("✅ Finalizado:", job.id));
worker.on("failed", (job, err) =>
  console.log("❌ Falhou:", err.message)
);