import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'AssetManager',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // File upload limits
  maxFileSizeImage: parseInt(
    process.env.MAX_FILE_SIZE_IMAGE || '10485760',
    10,
  ), // 10MB
  maxFileSizeDocument: parseInt(
    process.env.MAX_FILE_SIZE_DOCUMENT || '52428800',
    10,
  ), // 50MB

  // Allowed MIME types
  allowedImageTypes: (
    process.env.ALLOWED_IMAGE_TYPES ||
    'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
  ).split(','),
  allowedDocumentTypes: (
    process.env.ALLOWED_DOCUMENT_TYPES ||
    'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ).split(','),
}));
