import { Injectable, Inject } from '@nestjs/common';
import {
  GetAssetUseCase,
  GetAssetInput,
  GetAssetOutput,
} from '@core/ports/inbound/get-asset.use-case';
import { AssetRepositoryPort } from '@core/ports/outbound/asset-repository.port';
import { FileStoragePort } from '@core/ports/outbound/file-storage.port';
import { AssetId } from '@core/domain/value-objects/asset-id.vo';
import { AssetNotFoundException } from '@shared/exceptions/asset-not-found.exception';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de aplicación para obtener/descargar activos
 * Implementa el caso de uso GetAssetUseCase
 */
@Injectable()
export class GetAssetService implements GetAssetUseCase {
  private readonly presignedUrlExpiration: number;

  constructor(
    @Inject('AssetRepositoryPort')
    private readonly assetRepository: AssetRepositoryPort,
    @Inject('FileStoragePort')
    private readonly fileStorage: FileStoragePort,
    private readonly configService: ConfigService,
  ) {
    this.presignedUrlExpiration = this.configService.get<number>(
      'PRESIGNED_URL_EXPIRATION',
      3600,
    );
  }

  async execute(input: GetAssetInput): Promise<GetAssetOutput> {
    // 1. Buscar el activo por ID
    const assetId = AssetId.fromString(input.assetId);
    const asset = await this.assetRepository.findById(assetId);

    if (!asset) {
      throw new AssetNotFoundException(input.assetId);
    }

    // 2. Verificar que el activo esté disponible
    if (!asset.isAvailable()) {
      throw new BadRequestException(
        `Asset '${input.assetId}' is not available. Status: ${asset.status}`,
      );
    }

    // 3. Verificar expiración
    asset.checkAndMarkExpired();
    if (asset.isExpired()) {
      // Actualizar estado en BD
      await this.assetRepository.update(asset);
      throw new BadRequestException(`Asset '${input.assetId}' has expired`);
    }

    // 4. Generar URL pre-firmada de S3
    const presignedUrl = await this.fileStorage.generatePresignedUrl(
      asset.s3Location,
      {
        expiresIn: this.presignedUrlExpiration,
        responseContentType: asset.fileMetadata.mimeType,
        responseContentDisposition: `attachment; filename="${asset.fileMetadata.originalName}"`,
      },
    );

    // 5. Retornar resultado
    return {
      presignedUrl,
      fileName: asset.fileMetadata.originalName,
      mimeType: asset.fileMetadata.mimeType,
      expiresIn: this.presignedUrlExpiration,
    };
  }
}
