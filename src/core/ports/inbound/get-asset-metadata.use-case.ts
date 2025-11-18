import { AssetType } from '../../domain/enums/asset-type.enum';
import { AssetStatus } from '../../domain/enums/asset-status.enum';
import { OwnerType } from '../../domain/enums/owner-type.enum';

/**
 * Input para obtener metadatos de un activo
 */
export interface GetAssetMetadataInput {
  assetId: string;
}

/**
 * Output de metadatos de un activo
 */
export interface GetAssetMetadataOutput {
  assetId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  fileSizeReadable: string;
  fileHash: string;
  assetType: AssetType;
  s3Bucket: string;
  s3Key: string;
  s3Region: string;
  ownerId?: string;
  ownerType?: OwnerType;
  context?: string;
  tags: string[];
  metadata: Record<string, any>;
  uploadedBy?: string;
  status: AssetStatus;
  isPublic: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GetAssetMetadataUseCase Port (Primary Port)
 * Caso de uso para obtener los metadatos de un activo
 */
export interface GetAssetMetadataUseCase {
  execute(input: GetAssetMetadataInput): Promise<GetAssetMetadataOutput>;
}
