import { Queue } from 'bullmq';

export const scrapeQueue = new Queue('scrape', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});