import { BadRequestException } from '@nestjs/common';
import { AssetType } from '@core/domain/enums/asset-type.enum';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception';

/**
 * Configuración de validación de archivos
 */
interface FileValidationConfig {
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  maxImageSize: number;
  maxDocumentSize: number;
}

/**
 * Utilidad para validar archivos
 */
export class FileValidator {
  constructor(private readonly config: FileValidationConfig) {}

  /**
   * Determina el tipo de activo basado en el MIME type
   */
  determineAssetType(mimeType: string): AssetType {
    if (this.config.allowedImageTypes.includes(mimeType)) {
      return AssetType.IMAGE;
    }

    if (this.config.allowedDocumentTypes.includes(mimeType)) {
      return AssetType.DOCUMENT;
    }

    throw new InvalidFileTypeException(mimeType, [
      ...this.config.allowedImageTypes,
      ...this.config.allowedDocumentTypes,
    ]);
  }

  /**
   * Valida el tamaño del archivo
   */
  validateFileSize(fileSize: number, assetType: AssetType): void {
    const maxSize =
      assetType === AssetType.IMAGE
        ? this.config.maxImageSize
        : this.config.maxDocumentSize;

    if (fileSize > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`,
      );
    }

    if (fileSize === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Valida el tipo MIME
   */
  validateMimeType(mimeType: string): void {
    const allAllowedTypes = [
      ...this.config.allowedImageTypes,
      ...this.config.allowedDocumentTypes,
    ];

    if (!allAllowedTypes.includes(mimeType)) {
      throw new InvalidFileTypeException(mimeType, allAllowedTypes);
    }
  }

  /**
   * Valida archivo completo
   */
  validateFile(
    buffer: Buffer,
    mimeType: string,
    originalName: string,
  ): AssetType {
    // Validar que el archivo no esté vacío
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    // Validar nombre del archivo
    if (!originalName || originalName.trim().length === 0) {
      throw new BadRequestException('File name is required');
    }

    // Validar MIME type
    this.validateMimeType(mimeType);

    // Determinar tipo de activo
    const assetType = this.determineAssetType(mimeType);

    // Validar tamaño
    this.validateFileSize(buffer.length, assetType);

    return assetType;
  }

  /**
   * Formatea bytes a formato legible
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Genera un nombre de archivo único
   */
  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(originalName);

    return `${timestamp}_${randomString}${extension}`;
  }

  /**
   * Obtiene la extensión del archivo
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
  }
}
