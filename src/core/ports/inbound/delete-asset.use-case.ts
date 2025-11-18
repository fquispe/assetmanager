/**
 * Input para eliminar un activo
 */
export interface DeleteAssetInput {
  assetId: string;
}

/**
 * Output de eliminar un activo
 */
export interface DeleteAssetOutput {
  assetId: string;
  deleted: boolean;
  deletedAt: Date;
}

/**
 * DeleteAssetUseCase Port (Primary Port)
 * Caso de uso para eliminar un activo (soft delete)
 */
export interface DeleteAssetUseCase {
  execute(input: DeleteAssetInput): Promise<DeleteAssetOutput>;
}
