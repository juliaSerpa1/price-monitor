import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAIService } from '../llm/openai.service';

type EmbeddingRow = {
    id: string;
    content: string;
    vector: number[];
};

@Injectable()
export class RagService {
    constructor(
        private embeddings: EmbeddingsService,
        private prisma: PrismaService,
        private openai: OpenAIService
    ) { }

async ask(question: string, targetId?: string) {
  const vector = await this.embeddings.generate(question);

  let query;

  if (targetId) {
    query = this.prisma.$queryRaw<EmbeddingRow[]>`
      SELECT id, content
      FROM "Embedding"
      WHERE "targetId" = ${targetId}
      ORDER BY vector <-> ${vector}::vector
      LIMIT 5
    `;
  } else {
    query = this.prisma.$queryRaw<EmbeddingRow[]>`
      SELECT id, content
      FROM "Embedding"
      ORDER BY vector <-> ${vector}::vector
      LIMIT 5
    `;
  }

  const similar = await query;

  const context = similar
    .map((s) => s.content)
    .filter(Boolean)
    .join('\n');

return this.openai.chat(`
Você é um especialista em análise de preços.

REGRAS:
- Sempre use o NOME do produto
- Nunca mencione IDs ou códigos internos
- Responda de forma clara para usuários leigos

Contexto:
${context || 'Sem dados'}

Pergunta:
${question}
`);
}
}