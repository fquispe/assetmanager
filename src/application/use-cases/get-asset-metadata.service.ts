import { Injectable, Inject } from '@nestjs/common';
import {
  GetAssetMetadataUseCase,
  GetAssetMetadataInput,
  GetAssetMetadataOutput,
} from '@core/ports/inbound/get-asset-metadata.use-case';
import { AssetRepositoryPort } from '@core/ports/outbound/asset-repository.port';
import { AssetId } from '@core/domain/value-objects/asset-id.vo';
import { AssetNotFoundException } from '@shared/exceptions/asset-not-found.exception';

/**
 * Servicio de aplicación para obtener metadatos de activos
 * Implementa el caso de uso GetAssetMetadataUseCase
 */
@Injectable()
export class GetAssetMetadataService implements GetAssetMetadataUseCase {
  constructor(
    @Inject('AssetRepositoryPort')
    private readonly assetRepository: AssetRepositoryPort,
  ) {}

  async execute(
    input: GetAssetMetadataInput,
  ): Promise<GetAssetMetadataOutput> {
    // 1. Buscar el activo por ID
    const assetId = AssetId.fromString(input.assetId);
    const asset = await this.assetRepository.findById(assetId);

    if (!asset) {
      throw new AssetNotFoundException(input.assetId);
    }

    // 2. Verificar y actualizar estado de expiración
    asset.checkAndMarkExpired();
    if (asset.isExpired()) {
      await this.assetRepository.update(asset);
    }

    // 3. Mapear a output
    return {
      assetId: asset.assetId.toString(),
      fileName: asset.fileMetadata.fileName,
      originalName: asset.fileMetadata.originalName,
      mimeType: asset.fileMetadata.mimeType,
      fileSize: asset.fileMetadata.fileSize,
      fileSizeReadable: asset.fileMetadata.getReadableSize(),
      fileHash: asset.fileMetadata.fileHash,
      assetType: asset.fileMetadata.assetType,
      s3Bucket: asset.s3Location.bucket,
      s3Key: asset.s3Location.key,
      s3Region: asset.s3Location.region,
      ownerId: asset.ownerId,
      ownerType: asset.ownerType,
      context: asset.context,
      tags: asset.tags,
      metadata: asset.metadata,
      uploadedBy: asset.uploadedBy,
      status: asset.status,
      isPublic: asset.isPublic,
      expiresAt: asset.expiresAt,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
