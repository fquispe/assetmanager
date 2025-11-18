import * as crypto from 'crypto';

/**
 * Utilidad para generar hashes de archivos
 */
export class HashUtil {
  /**
   * Genera hash SHA256 de un buffer
   */
  static generateSHA256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Genera hash MD5 de un buffer
   */
  static generateMD5(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Verifica un hash SHA256
   */
  static verifySHA256(buffer: Buffer, hash: string): boolean {
    const generatedHash = this.generateSHA256(buffer);
    return generatedHash === hash;
  }
}
