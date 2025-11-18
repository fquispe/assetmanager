import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  imagesBucket: process.env.S3_IMAGES_BUCKET,
  documentsBucket: process.env.S3_DOCUMENTS_BUCKET,
  presignedUrlExpiration: parseInt(
    process.env.PRESIGNED_URL_EXPIRATION || '3600',
    10,
  ),
}));
