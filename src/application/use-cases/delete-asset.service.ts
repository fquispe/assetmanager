import { Injectable, Inject } from '@nestjs/common';
import {
  DeleteAssetUseCase,
  DeleteAssetInput,
  DeleteAssetOutput,
} from '@core/ports/inbound/delete-asset.use-case';
import { AssetRepositoryPort } from '@core/ports/outbound/asset-repository.port';
import { FileStoragePort } from '@core/ports/outbound/file-storage.port';
import { AssetId } from '@core/domain/value-objects/asset-id.vo';
import { AssetNotFoundException } from '@shared/exceptions/asset-not-found.exception';

/**
 * Servicio de aplicación para eliminar activos
 * Implementa el caso de uso DeleteAssetUseCase
 */
@Injectable()
export class DeleteAssetService implements DeleteAssetUseCase {
  constructor(
    @Inject('AssetRepositoryPort')
    private readonly assetRepository: AssetRepositoryPort,
    @Inject('FileStoragePort')
    private readonly fileStorage: FileStoragePort,
  ) {}

  async execute(input: DeleteAssetInput): Promise<DeleteAssetOutput> {
    // 1. Buscar el activo por ID
    const assetId = AssetId.fromString(input.assetId);
    const asset = await this.assetRepository.findById(assetId);

    if (!asset) {
      throw new AssetNotFoundException(input.assetId);
    }

    // 2. Marcar el activo como eliminado (soft delete en dominio)
    asset.delete();

    // 3. Actualizar en base de datos
    await this.assetRepository.update(asset);

    // 4. Eliminar archivo físico de S3
    try {
      await this.fileStorage.deleteFile(asset.s3Location);
    } catch (error) {
      // Log error pero no fallar la operación
      // El archivo en BD ya está marcado como eliminado
      console.error(
        `Failed to delete file from S3: ${asset.s3Location.getUri()}`,
        error,
      );
    }

    // 5. Retornar resultado
    return {
      assetId: asset.assetId.toString(),
      deleted: true,
      deletedAt: asset.deletedAt!,
    };
  }
}
