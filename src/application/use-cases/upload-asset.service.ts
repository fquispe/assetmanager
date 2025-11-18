import { Injectable, Inject } from '@nestjs/common';
import {
  UploadAssetUseCase,
  UploadAssetInput,
  UploadAssetOutput,
} from '@core/ports/inbound/upload-asset.use-case';
import { AssetRepositoryPort } from '@core/ports/outbound/asset-repository.port';
import { FileStoragePort } from '@core/ports/outbound/file-storage.port';
import { Asset } from '@core/domain/entities/asset.entity';
import { FileMetadata } from '@core/domain/value-objects/file-metadata.vo';
import { FileValidator } from '@shared/utils/file-validator.util';
import { HashUtil } from '@shared/utils/hash.util';

/**
 * Servicio de aplicación para subir activos
 * Implementa el caso de uso UploadAssetUseCase
 */
@Injectable()
export class UploadAssetService implements UploadAssetUseCase {
  constructor(
    @Inject('AssetRepositoryPort')
    private readonly assetRepository: AssetRepositoryPort,
    @Inject('FileStoragePort')
    private readonly fileStorage: FileStoragePort,
    private readonly fileValidator: FileValidator,
  ) {}

  async execute(input: UploadAssetInput): Promise<UploadAssetOutput> {
    // 1. Validar el archivo
    const assetType = this.fileValidator.validateFile(
      input.file.buffer,
      input.file.mimeType,
      input.file.originalName,
    );

    // 2. Generar hash del archivo
    const fileHash = HashUtil.generateSHA256(input.file.buffer);

    // 3. Verificar si ya existe un archivo con el mismo hash (deduplicación)
    const existingAsset = await this.assetRepository.findByHash(fileHash);
    if (existingAsset) {
      // Si ya existe, retornar el existente en lugar de subir duplicado
      return this.mapToOutput(existingAsset);
    }

    // 4. Generar nombre único para el archivo
    const fileName = this.fileValidator.generateUniqueFileName(
      input.file.originalName,
    );

    // 5. Subir archivo a S3
    const uploadResult = await this.fileStorage.uploadFile({
      buffer: input.file.buffer,
      fileName,
      mimeType: input.file.mimeType,
      assetType,
    });

    // 6. Crear entidad Asset del dominio
    const fileMetadata = new FileMetadata(
      fileName,
      input.file.originalName,
      input.file.mimeType,
      input.file.buffer.length,
      fileHash,
      assetType,
    );

    const asset = Asset.create(
      fileMetadata,
      uploadResult.s3Location,
      input.ownerId,
      input.ownerType,
      input.context,
      input.uploadedBy,
      input.tags || [],
      input.metadata || {},
    );

    // 7. Configurar expiración si se proporcionó
    if (input.expiresAt) {
      asset.setExpirationDate(input.expiresAt);
    }

    // 8. Marcar como activo (carga completada)
    asset.markAsActive();

    // 9. Persistir en base de datos
    const savedAsset = await this.assetRepository.save(asset);

    // 10. Retornar resultado
    return this.mapToOutput(savedAsset);
  }

  /**
   * Mapea la entidad Asset al output del caso de uso
   */
  private mapToOutput(asset: Asset): UploadAssetOutput {
    return {
      assetId: asset.assetId.toString(),
      fileName: asset.fileMetadata.fileName,
      fileSize: asset.fileMetadata.fileSize,
      mimeType: asset.fileMetadata.mimeType,
      assetType: asset.fileMetadata.assetType,
      s3Location: asset.s3Location.getUri(),
      createdAt: asset.createdAt,
    };
  }
}
