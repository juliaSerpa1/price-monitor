// worker.js
const { Worker } = require("bullmq");
const puppeteer = require("puppeteer");

const API_URL = "http://localhost:3000";

const worker = new Worker(
  "scrape",
  async (job) => {
    const { targetId } = job.data;

    try {
      // 🔥 1. buscar target na API
      const res = await fetch(`${API_URL}/targets/${targetId}`);
      const target = await res.json();

      if (!target) return;

      console.log("Scraping:", target.name);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto(target.url, { waitUntil: "networkidle2" });
      await page.waitForSelector(target.selector, { timeout: 20000 });

      await page.screenshot({ path: "debug.png", fullPage: true });
      
      const raw = await page.$eval(
        target.selector,
        (el) => el.innerText
      );

      const price = parseFloat(
        raw.replace(/[^\d.,]/g, "").replace(",", ".")
      );

      console.log("Preço capturado:", price);

      // 🔥 2. enviar preço para API
      await fetch(`${API_URL}/targets/price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          price,
        }),
      });

      await page.close();
      await browser.close();
    } catch (err) {
      console.error("Erro scraping:", err.message);
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);