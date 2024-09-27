import crypto, { CipherGCM, DecipherGCM } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

export class SecureDataService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;

  constructor(private masterKey: string) {}

  async encrypt(data: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16);
    const key = await scrypt(this.masterKey, salt, this.keyLength) as Buffer;
    const cipher = crypto.createCipheriv(this.algorithm, key, iv) as CipherGCM;
    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();  // Get authentication tag for AES-GCM
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  async decrypt(encryptedData: string): Promise<string> {
    const buffer = Buffer.from(encryptedData, 'base64');
    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 32);
    const tag = buffer.subarray(32, 48);
    const encrypted = buffer.subarray(48);
    const key = await scrypt(this.masterKey, salt, this.keyLength) as Buffer;
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv) as DecipherGCM;
    decipher.setAuthTag(tag);  // Set the authentication tag for AES-GCM
    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
