import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class EmbeddingsService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async generate(text: string) {
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return res.data[0].embedding;
  }
}