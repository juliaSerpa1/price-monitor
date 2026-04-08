// targets.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { scrapeQueue } from '../queue/queue';

@Injectable()
export class TargetsService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    const target = await this.prisma.target.create({ data });

    // 🔥 1. roda AGORA
    await scrapeQueue.add('scrape', {
      targetId: target.id,
    });

    // 🔥 2. roda TODO DIA
    await scrapeQueue.add(
      'scrape',
      { targetId: target.id },
      {
        jobId: `${target.id}-repeat`,
        repeat: {
          pattern: '0 0 * * *',
        },
      }
    );

    console.log("📩 Job enviado para fila:", target.id);

    return target;
  }

  // 🔥 NOVO
  async findOne(id: string) {
    return this.prisma.target.findUnique({
      where: { id },
    });
  }

  // 🔥 NOVO
  async savePrice(data: { targetId: string; price: number }) {
    console.log("💾 Salvando preço:", data);

    return this.prisma.priceHistory.create({
      data,
    });
  }

  async getHistory(id: string) {
    return this.prisma.priceHistory.findMany({
      where: { targetId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.target.findMany();
  }

  async getStats() {
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    // 🔥 conta direto no banco
    const coletasHoje = await this.prisma.priceHistory.count({
      where: {
        createdAt: {
          gte: inicioHoje,
          lte: fimHoje,
        },
      },
    });

    const histories = await this.prisma.priceHistory.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const map = new Map();

    for (const h of histories) {
      const list = map.get(h.targetId) || [];
      list.push(h);
      map.set(h.targetId, list);
    }

    let variacoes: number[] = [];

    for (const [, history] of map) {
      if (history.length >= 2) {
        const last = Number(history[history.length - 1].price);
        const prev = Number(history[history.length - 2].price);

        if (prev > 0) {
          const diff = ((last - prev) / prev) * 100;
          variacoes.push(diff);
        }
      }
    }

    const variacao =
      variacoes.length > 0
        ? variacoes.reduce((a, b) => a + b, 0) / variacoes.length
        : 0;

    return {
      coletasHoje: coletasHoje ?? 0,
      variacao,
    };
  }

  async remove(id: string) {
    return this.prisma.target.delete({
      where: { id },
    });
  }
}