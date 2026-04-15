import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { OpenAIService } from './llm/openai.service';
import { RagService } from './rag/rag.service';
import { OrionAgent } from './agents/orion.agent';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ForecastService } from '../analytics/forecast.service';

@Module({
  controllers: [AiController],
  providers: [
    EmbeddingsService,
    OpenAIService,
    RagService,
    OrionAgent,
    PrismaService,
    ForecastService,
  ],
  exports: [EmbeddingsService, RagService, OrionAgent],
})
export class AiModule {}