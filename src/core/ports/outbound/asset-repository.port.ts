import { Asset } from '../../domain/entities/asset.entity';
import { AssetId } from '../../domain/value-objects/asset-id.vo';
import { AssetStatus } from '../../domain/enums/asset-status.enum';
import { OwnerType } from '../../domain/enums/owner-type.enum';

/**
 * Filtros para búsqueda de activos
 */
export interface AssetFilters {
  ownerId?: string;
  ownerType?: OwnerType;
  context?: string;
  status?: AssetStatus;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Resultado paginado de activos
 */
export interface PaginatedAssets {
  assets: Asset[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * AssetRepository Port (Secondary Port)
 * Define el contrato para persistencia de activos
 * Implementado por el adaptador de PostgreSQL
 */
export interface AssetRepositoryPort {
  /**
   * Guarda un nuevo activo
   */
  save(asset: Asset): Promise<Asset>;

  /**
   * Busca un activo por su ID
   */
  findById(assetId: AssetId): Promise<Asset | null>;

  /**
   * Busca activos con filtros
   */
  findWithFilters(filters: AssetFilters): Promise<PaginatedAssets>;

  /**
   * Actualiza un activo existente
   */
  update(asset: Asset): Promise<Asset>;

  /**
   * Elimina un activo (soft delete)
   */
  delete(assetId: AssetId): Promise<void>;

  /**
   * Verifica si existe un activo con el hash dado
   */
  existsByHash(fileHash: string): Promise<boolean>;

  /**
   * Encuentra un activo por hash
   */
  findByHash(fileHash: string): Promise<Asset | null>;
}
