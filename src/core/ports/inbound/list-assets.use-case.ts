import { AssetType } from '../../domain/enums/asset-type.enum';
import { AssetStatus } from '../../domain/enums/asset-status.enum';
import { OwnerType } from '../../domain/enums/owner-type.enum';

/**
 * Input para listar activos
 */
export interface ListAssetsInput {
  ownerId?: string;
  ownerType?: OwnerType;
  context?: string;
  status?: AssetStatus;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Item de activo en lista
 */
export interface AssetListItem {
  assetId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileSizeReadable: string;
  assetType: AssetType;
  ownerId?: string;
  ownerType?: OwnerType;
  context?: string;
  tags: string[];
  status: AssetStatus;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Output de listar activos
 */
export interface ListAssetsOutput {
  assets: AssetListItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * ListAssetsUseCase Port (Primary Port)
 * Caso de uso para listar/buscar activos con filtros
 */
export interface ListAssetsUseCase {
  execute(input: ListAssetsInput): Promise<ListAssetsOutput>;
}
