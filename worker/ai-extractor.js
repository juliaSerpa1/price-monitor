const { OpenAI } = require("openai");
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractPriceAI(html) {
  const prompt = `
Você é um extrator de preço de e-commerce brasileiro.

REGRAS IMPORTANTES:
- Retorne o preço à vista do produto (não parcelado)
- Ignore valores como:
  - "x de R$ ..."
  - "sem juros"
  - parcelas
- Ignore preço antigo (riscado)
- Ignore preço de cartão específico
- Priorize o menor preço à vista visível
- O preço deve ser o valor total do produto

Retorne APENAS JSON:
{ "price": number }

HTML:
${html.slice(0, 15000)}
`;

  const res = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return null;
  }
}

module.exports = { extractPriceAI };