import { S3Location } from '../../domain/value-objects/s3-location.vo';
import { AssetType } from '../../domain/enums/asset-type.enum';

/**
 * Opciones para subir archivo
 */
export interface UploadFileOptions {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  assetType: AssetType;
  metadata?: Record<string, string>;
}

/**
 * Resultado de subida de archivo
 */
export interface UploadFileResult {
  s3Location: S3Location;
  eTag?: string;
}

/**
 * Opciones para generar URL pre-firmada
 */
export interface PresignedUrlOptions {
  expiresIn?: number; // segundos
  responseContentType?: string;
  responseContentDisposition?: string;
}

/**
 * FileStoragePort (Secondary Port)
 * Define el contrato para almacenamiento de archivos
 * Implementado por el adaptador de S3
 */
export interface FileStoragePort {
  /**
   * Sube un archivo al almacenamiento
   */
  uploadFile(options: UploadFileOptions): Promise<UploadFileResult>;

  /**
   * Descarga un archivo del almacenamiento
   */
  downloadFile(s3Location: S3Location): Promise<Buffer>;

  /**
   * Genera una URL pre-firmada para descarga segura
   */
  generatePresignedUrl(
    s3Location: S3Location,
    options?: PresignedUrlOptions,
  ): Promise<string>;

  /**
   * Elimina un archivo del almacenamiento
   */
  deleteFile(s3Location: S3Location): Promise<void>;

  /**
   * Verifica si un archivo existe
   */
  fileExists(s3Location: S3Location): Promise<boolean>;

  /**
   * Obtiene el bucket correcto según el tipo de activo
   */
  getBucketForAssetType(assetType: AssetType): string;
}
