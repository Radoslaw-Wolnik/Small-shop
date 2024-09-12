// src/scripts/cleanup-revoked-tokens.ts

import mongoose from 'mongoose';
import cron from 'node-cron';
import RevokedToken from '../models/revoked-token.model';
import logger from '../utils/logger.util';
import enviorement from '../config/environment';

const cleanupRevokedTokens = async () => {
  try {
    const result = await RevokedToken.deleteMany({ expiresAt: { $lt: new Date() } });
    logger.info(`Cleaned up ${result.deletedCount} expired revoked tokens`);
  } catch (error) {
    logger.error('Error cleaning up revoked tokens:', error);
  }
};

const scheduleCleanup = () => {
  // Run cleanup daily at midnight
  cron.schedule('0 0 * * *', async () => {
    logger.info('Starting scheduled cleanup of revoked tokens');
    await cleanupRevokedTokens();
  });
};

const initCleanupJob = async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await mongoose.connect(enviorement.database.uri);
      logger.info('Connected to MongoDB for token cleanup job');
      scheduleCleanup();
      logger.info('Token cleanup job scheduled');
    } catch (error) {
      logger.error('Failed to initialize token cleanup job:', error);
    }
  } else {
    logger.info('Token cleanup job not scheduled in development environment');
  }
};

export { initCleanupJob, cleanupRevokedTokens };