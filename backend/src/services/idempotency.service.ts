import { Redis } from 'ioredis';

export class IdempotencyService {
  constructor(private redisClient: Redis) {}

  async execute<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const lockKey = `lock:${key}`;
    const resultKey = `result:${key}`;

    try {
      const acquired = await this.redisClient.set(lockKey, '1', 'NX', 'EX', 60);
      if (!acquired) {
        const storedResult = await this.redisClient.get(resultKey);
        if (storedResult) {
          return JSON.parse(storedResult);
        }
        throw new Error('Operation in progress');
      }

      const result = await operation();
      await this.redisClient.set(resultKey, JSON.stringify(result), 'EX', 86400); // Store for 24 hours
      return result;
    } finally {
      await this.redisClient.del(lockKey);
    }
  }
}