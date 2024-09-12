import mongoose from 'mongoose';
import User, { IUserDocument } from '../models/user.model';
import { encrypt, decrypt } from '../utils/encryption.util';
import environment from '../config/environment';

const BATCH_SIZE = 100; // Number of users to process in each batch

async function connectToDatabase() {
  await mongoose.connect(environment.database.uri);
  console.log('Connected to MongoDB');
}

async function rotateEncryptionKey(startIndex: number = 0): Promise<number> {
  const users = await User.find({}).skip(startIndex).limit(BATCH_SIZE);

  for (const user of users) {
    try {
      // Decrypt email with old key
      const decryptedEmail = await decrypt(user.email, process.env.OLD_ENCRYPTION_KEY!);

      // Re-encrypt email with new key
      user.email = await encrypt(decryptedEmail);

      // Re-hash email with new key
      user.emailHash = User.hashEmail(decryptedEmail);

      await user.save();
      console.log(`Updated user: ${user._id}`);
    } catch (error) {
      console.error(`Failed to update user ${user._id}:`, error);
      // Continue with the next user instead of stopping the entire process
    }
  }

  return users.length;
}

async function rotateSecrets() {
  if (!environment.auth.oldEncryptionKey || !environment.auth.encryptionKey) {
    throw new Error('Both OLD_ENCRYPTION_KEY and ENCRYPTION_KEY must be provided');
  }

  await connectToDatabase();

  console.log('Starting secret rotation...');
  
  let startIndex = 0;
  let processedUsers = 0;
  let totalUsers = await User.countDocuments();

  while (processedUsers < totalUsers) {
    const batchSize = await rotateEncryptionKey(startIndex);
    processedUsers += batchSize;
    startIndex += batchSize;

    console.log(`Progress: ${processedUsers}/${totalUsers} users processed`);

    if (batchSize < BATCH_SIZE) {
      // We've processed all users
      break;
    }

    // Optional: add a small delay between batches to reduce database load
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Secret rotation completed');

  // Remove the OLD_ENCRYPTION_KEY from the environment
  delete process.env.OLD_ENCRYPTION_KEY;
  
  // Update the rotation status
  process.env.ROTATION_IN_PROGRESS = 'false';

  await mongoose.disconnect();
}

rotateSecrets().catch(console.error);