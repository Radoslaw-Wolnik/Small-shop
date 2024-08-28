import fs from 'fs/promises';
import path from 'path';

export const deleteFileFromStorage = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};