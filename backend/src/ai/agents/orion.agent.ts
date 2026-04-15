import { Injectable } from '@nestjs/common';
import { RagService } from '../rag/rag.service';
import { ForecastService } from '../../analytics/forecast.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrionAgent {
  constructor(
    private rag: RagService,
    private forecast: ForecastService,
    private prisma: PrismaService,
  ) { }

  async run(targetId: string) {
    const history = await this.prisma.priceHistory.findMany({
      where: { targetId },
      orderBy: { createdAt: 'asc' },
    });

    // 🔥 proteção
    if (!history.length) {
      return {
        prediction: null,
        insight: 'Ainda não há dados suficientes para análise.',
      };
    }

    const prices = history.map(h => Number(h.price));

    const currentPrice = prices.at(-1);

    // 🔥 proteção extra
    const prediction =
      prices.length >= 2
        ? await this.forecast.predict(prices)
        : currentPrice;

    const insight = await this.rag.ask(
      `
Analise esse produto:

Preço atual: ${currentPrice}
Previsão: ${prediction}

Histórico:
${prices.join(', ')}

Devo comprar agora?
`,
      targetId // 🔥 ESSENCIAL
    );

    return {
      prediction,
      insight,
    };
  }
}