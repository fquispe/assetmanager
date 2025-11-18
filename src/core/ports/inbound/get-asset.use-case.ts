/**
 * Input para obtener un activo
 */
export interface GetAssetInput {
  assetId: string;
}

/**
 * Output de obtener un activo
 */
export interface GetAssetOutput {
  presignedUrl: string;
  fileName: string;
  mimeType: string;
  expiresIn: number; // segundos
}

/**
 * GetAssetUseCase Port (Primary Port)
 * Caso de uso para obtener/descargar un activo
 * Retorna una URL pre-firmada de S3
 */
export interface GetAssetUseCase {
  execute(input: GetAssetInput): Promise<GetAssetOutput>;
}
