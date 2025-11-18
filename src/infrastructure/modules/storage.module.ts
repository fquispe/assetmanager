import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3FileStorageAdapter } from '../adapters/secondary/storage/s3/s3-file-storage.adapter';

/**
 * Módulo de almacenamiento
 * Configura el adaptador de S3
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FileStoragePort',
      useClass: S3FileStorageAdapter,
    },
  ],
  exports: ['FileStoragePort'],
})
export class StorageModule {}
