import * as tf from '@tensorflow/tfjs-node';

export class ForecastService {
  async predict(prices: number[]) {
    const xs = tf.tensor1d(prices.map((_, i) => i));
    const ys = tf.tensor1d(prices);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd',
    });

    await model.fit(xs, ys, { epochs: 100 });

    const next = model.predict(tf.tensor1d([prices.length])) as any;

    return next.dataSync()[0];
  }
}