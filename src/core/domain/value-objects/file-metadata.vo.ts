import { AssetType } from '../enums/asset-type.enum';

/**
 * FileMetadata Value Object
 * Encapsula la información descriptiva de un archivo
 */
export class FileMetadata {
  constructor(
    public readonly fileName: string,
    public readonly originalName: string,
    public readonly mimeType: string,
    public readonly fileSize: number,
    public readonly fileHash: string,
    public readonly assetType: AssetType,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.fileName || this.fileName.trim().length === 0) {
      throw new Error('fileName cannot be empty');
    }

    if (!this.originalName || this.originalName.trim().length === 0) {
      throw new Error('originalName cannot be empty');
    }

    if (!this.mimeType || this.mimeType.trim().length === 0) {
      throw new Error('mimeType cannot be empty');
    }

    if (this.fileSize <= 0) {
      throw new Error('fileSize must be greater than 0');
    }

    if (!this.fileHash || this.fileHash.trim().length === 0) {
      throw new Error('fileHash cannot be empty');
    }
  }

  /**
   * Convierte el tamaño del archivo a formato legible
   */
  getReadableSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
