// targets.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { scrapeQueue } from '../queue/queue';

@Injectable()
export class TargetsService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    const target = await this.prisma.target.create({ data });

    // 🔥 já agenda recorrente direto
    await scrapeQueue.add(
      'scrape',
      { targetId: target.id },
      {
        jobId: target.id, // evita duplicação
        repeat: {
          pattern: '0 0 * * *', // todo dia
        },
      }
    );

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
  const histories = await this.prisma.priceHistory.findMany({
    orderBy: { createdAt: 'asc' },
  });

  // 🔥 início e fim do dia (correto)
  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const fimHoje = new Date();
  fimHoje.setHours(23, 59, 59, 999);

  let coletasHoje = 0;

  const map = new Map<string, { price: number; createdAt: Date }[]>();

  for (const h of histories) {
    const list = map.get(h.targetId) || [];
    list.push(h);
    map.set(h.targetId, list);

    const data = new Date(h.createdAt);

    console.log("createdAt:", h.createdAt);
console.log("inicioHoje:", inicioHoje);
console.log("fimHoje:", fimHoje);

    // ✅ comparação correta
    if (data >= inicioHoje && data <= fimHoje) {
      coletasHoje++;
    }
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
    coletasHoje,
    variacao,
  };
}
}