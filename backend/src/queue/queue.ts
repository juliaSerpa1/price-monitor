import { Queue } from 'bullmq';

export const scrapeQueue = new Queue('scrape', {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});