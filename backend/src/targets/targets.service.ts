// targets.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { scrapeQueue } from '../queue/queue';

@Injectable()
export class TargetsService {
  constructor(private prisma: PrismaService) {}

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
}