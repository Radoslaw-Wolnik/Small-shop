import mongoose from 'mongoose';
import { checkDBHealth } from './db-connection.util'; // Import the DB health helper
import logger from './logger.util'; // Assuming you have a logger utility

// Utility function to check the overall health (e.g., for use in other parts of the app)
export const checkOverallHealth = async (): Promise<boolean> => {
  try {
    // Check if database connection is healthy using the helper
    if (checkDBHealth() !== 'Connected') {
      throw new Error('Database connection is not healthy');
    }

    // Add more checks as needed for other services (e.g., Redis, external APIs)

    return true;
  } catch (error) {
    logger.error('Overall health check failed:', error);
    return false;
  }
};
