import { Module } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { TargetsController } from './targets.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule], // 🔥 AQUI ESTÁ A SOLUÇÃO
  controllers: [TargetsController],
  providers: [TargetsService, PrismaService],
})
export class TargetsModule {}