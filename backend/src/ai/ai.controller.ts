import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { OrionAgent } from './agents/orion.agent';
import { RagService } from './rag/rag.service';

@Controller('ai')
export class AiController {
  constructor(
    private orion: OrionAgent,
    private rag: RagService,
  ) {}

  // 🔥 1. Insight por produto (usado no card)
  @Get(':targetId')
  async getInsight(@Param('targetId') targetId: string) {
    return this.orion.run(targetId);
  }

  // 🔥 2. Chat geral (usado no AiChat)
  @Post('ask')
  async ask(@Body() body: { question: string }) {
    const answer = await this.rag.ask(body.question);

    return {
      answer,
    };
  }
}