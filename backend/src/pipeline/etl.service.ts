import { Injectable } from '@nestjs/common';

@Injectable()
export class EtlService {
  async process(raw: any) {
    return {
      price: Number(raw.price),
      normalized: true,
      timestamp: new Date(),
    };
  }
}