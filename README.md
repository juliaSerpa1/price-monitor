📊 PriceMonitor

Sistema fullstack para monitoramento automatizado de preços com IA aplicada, capaz de:

- Monitorar preços via scraping
- Armazenar histórico
- Gerar previsões
- Produzir insights inteligentes (RAG + LLM)

🧠 Fase 2 — Inteligência Artificial (NOVO)

A aplicação evolui de um scraper para uma plataforma de inteligência de mercado, adicionando:

- Embeddings semânticos
- Busca por similaridade
- RAG (Retrieval-Augmented Generation)
- Agente de análise automática (Orion)
- Previsão de preços

🧱 Arquitetura
Frontend (Next.js)
        ↓
Backend (NestJS API)
        ↓
Fila (BullMQ + Redis)
        ↓
Worker (Puppeteer + IA fallback)
        ↓
Banco de Dados (PostgreSQL)
        ↓
Embeddings (vetores)
        ↓
RAG + LLM
        ↓
Agente Inteligente (Orion)

🚀 Stack

- Backend
NestJS
TypeScript
Prisma ORM
BullMQ
Redis
OpenAI (LLM + Embeddings)

- Worker
Node.js
Puppeteer
BullMQ
OpenAI (extração via IA fallback)

- Frontend
Next.js 16
React 19
TailwindCSS
shadcn/ui
Recharts

- Banco
PostgreSQL
(Opcional) pgvector

⚙️ Como funciona

🔹 Fluxo base (Scraping)
- Usuário cadastra um alvo (nome, URL, selector)
- Backend salva no banco
- Job enviado para fila
- Worker processa:
- API → JSON → DOM → IA fallback
- Preço retornado para API
- Histórico salvo

🔹 Fluxo IA (NOVO)
A cada preço coletado:
- Backend gera um embedding semântico
- Salva no banco com:
- Nome do produto
- ID
- Preço
- Quando o usuário pede análise:
- RAG busca dados similares
- LLM gera insight contextual

Agente combina:
-histórico
-previsão
-contexto semântico

🧠 Componentes de IA
📌 Embeddings

Transformam dados em vetores para busca inteligente.

Exemplo salvo:

{
  "name": "MacBook Pro 16",
  "id": "uuid",
  "price": 21788
}

📌 RAG (Retrieval-Augmented Generation)

Busca informações relevantes antes de perguntar para o LLM.

SELECT * FROM "Embedding"
ORDER BY vector <-> query_vector
LIMIT 5

📌 Agente Orion

Responsável por gerar insights:

- Analisa histórico de preços
- Calcula previsão
- Consulta RAG
- Retorna recomendação

📌 Forecast (Previsão)

Modelo simples que prevê tendência de preço com base no histórico.

📦 Setup do projeto
Pré-requisitos
Node.js 20
Docker
Redis

1. Redis
docker run -d -p 6379:6379 redis

2. PostgreSQL (Docker recomendado)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=price_monitor \
  -p 5432:5432 \
  postgres:15

3. Backend
cd backend

npm install

npx prisma migrate dev

npm run start:dev

4. Worker
cd worker

npm install

node worker.js

5. Frontend
cd frontend

npm install

npm run dev

🔌 Variáveis de ambiente
DATABASE_URL="postgresql://admin:admin@localhost:5432/price_monitor"
API_URL=http://localhost:3000

OPENAI_API_KEY=your_key_here

📡 Endpoints principais

Criar alvo
POST /targets

Listar alvos
GET /targets

Remover alvo
DELETE /targets/:id

Registrar preço (worker)
POST /targets/price

🔥 NOVO — Insights IA

GET /targets/:id/insights

Retorna:

{
  "prediction": 21000,
  "insight": "Recomendação de compra..."
}
📊 Frontend

O dashboard inclui:

- Cadastro de produtos
- Histórico de preços
- Gráficos
- Estatísticas
🔥 Insights com IA
🔥 Previsão de preço

📁 Estrutura
backend/
  src/
    targets/
    ai/
      embeddings/
      rag/
      agents/
      llm/
    analytics/
    queue/
    prisma/

worker/
  worker.js
  ai-extractor.js

frontend/
  app/
  components/
  types/

⚠️ Pontos de atenção

- Scraping
Sites variam muito
Sempre usar fallback (API → JSON → DOM → IA)

- IA
Embeddings devem conter:
nome
id
preço

Banco
Pode usar:
JSON (simples)
pgvector (performance)

📄 Licença

MIT

👨‍💻 Observações

Projeto evoluído para:

✅ Arquitetura escalável
✅ IA aplicada (RAG + Agente)
✅ Separação clara de responsabilidades