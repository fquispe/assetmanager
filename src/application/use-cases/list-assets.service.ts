import { Injectable, Inject } from '@nestjs/common';
import {
  ListAssetsUseCase,
  ListAssetsInput,
  ListAssetsOutput,
  AssetListItem,
} from '@core/ports/inbound/list-assets.use-case';
import {
  AssetRepositoryPort,
  AssetFilters,
} from '@core/ports/outbound/asset-repository.port';
import { Asset } from '@core/domain/entities/asset.entity';

/**
 * Servicio de aplicación para listar activos
 * Implementa el caso de uso ListAssetsUseCase
 */
@Injectable()
export class ListAssetsService implements ListAssetsUseCase {
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  constructor(
    @Inject('AssetRepositoryPort')
    private readonly assetRepository: AssetRepositoryPort,
  ) {}

  async execute(input: ListAssetsInput): Promise<ListAssetsOutput> {
    // 1. Validar y normalizar parámetros de paginación
    const limit = Math.min(
      input.limit || this.DEFAULT_LIMIT,
      this.MAX_LIMIT,
    );
    const offset = input.offset || 0;

    // 2. Construir filtros
    const filters: AssetFilters = {
      ownerId: input.ownerId,
      ownerType: input.ownerType,
      context: input.context,
      status: input.status,
      tags: input.tags,
      limit,
      offset,
    };

    // 3. Buscar activos en repositorio
    const result = await this.assetRepository.findWithFilters(filters);

    // 4. Mapear activos a output
    const assets = result.assets.map((asset) => this.mapToListItem(asset));

    // 5. Retornar resultado paginado
    return {
      assets,
      total: result.total,
      limit,
      offset,
      hasMore: offset + limit < result.total,
    };
  }

  /**
   * Mapea una entidad Asset a AssetListItem
   */
  private mapToListItem(asset: Asset): AssetListItem {
    return {
      assetId: asset.assetId.toString(),
      fileName: asset.fileMetadata.fileName,
      originalName: asset.fileMetadata.originalName,
      mimeType: asset.fileMetadata.mimeType,
      fileSize: asset.fileMetadata.fileSize,
      fileSizeReadable: asset.fileMetadata.getReadableSize(),
      assetType: asset.fileMetadata.assetType,
      ownerId: asset.ownerId,
      ownerType: asset.ownerType,
      context: asset.context,
      tags: asset.tags,
      status: asset.status,
      uploadedBy: asset.uploadedBy,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
