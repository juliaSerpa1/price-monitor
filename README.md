📊 PriceMonitor

Sistema fullstack para monitoramento automatizado de preços a partir de páginas web utilizando URL + seletor CSS.
A aplicação realiza scraping assíncrono com fila, armazena histórico de preços e exibe métricas e gráficos em um dashboard.

🧱 Arquitetura

Frontend (Next.js)
        ↓
Backend (NestJS API)
        ↓
Fila (BullMQ + Redis)
        ↓
Worker (Puppeteer)

🚀 Stack

- Backend
NestJS
TypeScript
Prisma ORM
BullMQ
Redis

- Worker
Node.js
Puppeteer
BullMQ

- Frontend
Next.js 16
React 19
TailwindCSS
shadcn/ui
Recharts

⚙️ Como funciona

-Usuário cadastra um alvo (nome, URL, selector)
-Backend persiste o alvo
-Um job é enviado para a fila (scrape)
-Worker consome o job
-Puppeteer acessa a página e extrai o valor
-O preço é enviado de volta para a API
-Backend salva o histórico
-Frontend exibe os dados atualizados

📦 Setup do projeto

-Pré-requisitos
Node.js 20
Docker
Redis

1. Redis (Docker)
docker run -d -p 6379:6379 redis

2. Backend
- cd backend

- npm install
- npm run start:dev

API disponível em:
- http://localhost:3000

3. Worker
- cd worker

- npm install
- node worker.js

4. Frontend
- cd frontend

- npm install
- npm run dev

Acesse:
- http://localhost:3001

🔌 Configuração

CORS (NestJS)
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});

-- Variáveis de ambiente

REDIS_HOST=localhost
REDIS_PORT=6379

API_URL=http://localhost:3000

DATABASE_URL="postgresql://admin:admin@localhost:5432/price_monitor"

📡 Endpoints principais

- Criar alvo
POST /targets
{
  "name": "Produto",
  "url": "https://site.com",
  "selector": ".price"
}

- Listar alvos
GET /targets

- Remover alvo
DELETE /targets/:id

- Registrar preço (interno - worker)
POST /targets/price

⚠️ Pontos de atenção

-Seletores CSS
Devem ser específicos e estáveis
Evite classes dinâmicas
Teste no console do navegador:
document.querySelector("SELETOR")
Páginas dinâmicas

-Pode ser necessário ajustar estratégia:
networkidle2
delays adicionais
Parsing de preço
Diferentes formatos (R$, . e ,)
Pode exigir tratamento específico por site

📊 Frontend

O dashboard inclui:
- Cadastro de alvos
- Listagem com status
- Exclusão de itens
- Estatísticas gerais
- Gráfico de histórico de preços

📁 Estrutura sugerida

backend/
  src/
    targets/
    queue/
    prisma/

worker/
  worker.js

frontend/
  app/
  components/
  types/
  
🔮 Melhorias possíveis
- Agendamento por intervalo (cron)
- Alertas (email, webhook)
- Autenticação
- Retry/backoff na fila
- Normalização de preços por domínio
- Detecção automática de selector

📄 Licença

MIT

👨‍💻 Observações

Projeto estruturado com foco em:
Separação de responsabilidades (API / Worker)
Escalabilidade via fila
Facilidade de extensão