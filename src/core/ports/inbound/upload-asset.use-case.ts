import { Asset } from '../../domain/entities/asset.entity';
import { AssetType } from '../../domain/enums/asset-type.enum';
import { OwnerType } from '../../domain/enums/owner-type.enum';

/**
 * Input para subir un activo
 */
export interface UploadAssetInput {
  file: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
  };
  ownerId?: string;
  ownerType?: OwnerType;
  context?: string;
  uploadedBy?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

/**
 * Output de subir un activo
 */
export interface UploadAssetOutput {
  assetId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  assetType: AssetType;
  s3Location: string;
  createdAt: Date;
}

/**
 * UploadAssetUseCase Port (Primary Port)
 * Caso de uso para subir un nuevo activo
 */
export interface UploadAssetUseCase {
  execute(input: UploadAssetInput): Promise<UploadAssetOutput>;
}
