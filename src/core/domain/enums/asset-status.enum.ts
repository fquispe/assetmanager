/**
 * AssetStatus Enum
 * Define los diferentes estados en el ciclo de vida de un activo
 */
export enum AssetStatus {
  ACTIVE = 'active',         // Activo y disponible para uso
  PROCESSING = 'processing', // En proceso de carga/procesamiento
  DELETED = 'deleted',       // Eliminado (soft delete)
  EXPIRED = 'expired',       // Expirado (basado en expires_at)
}
