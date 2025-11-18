/**
 * AssetType Enum
 * Define los tipos de activos soportados por el sistema
 * Determina en qué bucket de S3 se almacenará el archivo
 */
export enum AssetType {
  IMAGE = 'image',      // Imágenes: JPG, PNG, GIF, WEBP, SVG
  DOCUMENT = 'document', // Documentos: PDF, Word, Excel, etc.
}
