import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { StorageModule } from './storage.module';

// Use cases
import { UploadAssetService } from '@application/use-cases/upload-asset.service';
import { GetAssetService } from '@application/use-cases/get-asset.service';
import { GetAssetMetadataService } from '@application/use-cases/get-asset-metadata.service';
import { DeleteAssetService } from '@application/use-cases/delete-asset.service';
import { ListAssetsService } from '@application/use-cases/list-assets.service';

// Utils
import { FileValidator } from '@shared/utils/file-validator.util';

// Controller
import { AssetController } from '../adapters/primary/rest/asset.controller';

/**
 * Módulo principal de Asset
 * Configura todos los casos de uso, utilidades y controladores
 */
@Module({
  imports: [ConfigModule, DatabaseModule, StorageModule],
  controllers: [AssetController],
  providers: [
    // File Validator
    {
      provide: FileValidator,
      useFactory: (configService: ConfigService) => {
        return new FileValidator({
          allowedImageTypes: configService.get<string[]>(
            'ALLOWED_IMAGE_TYPES',
            [],
          ),
          allowedDocumentTypes: configService.get<string[]>(
            'ALLOWED_DOCUMENT_TYPES',
            [],
          ),
          maxImageSize: configService.get<number>('MAX_FILE_SIZE_IMAGE', 0),
          maxDocumentSize: configService.get<number>(
            'MAX_FILE_SIZE_DOCUMENT',
            0,
          ),
        });
      },
      inject: [ConfigService],
    },

    // Use Cases
    {
      provide: 'UploadAssetUseCase',
      useClass: UploadAssetService,
    },
    {
      provide: 'GetAssetUseCase',
      useClass: GetAssetService,
    },
    {
      provide: 'GetAssetMetadataUseCase',
      useClass: GetAssetMetadataService,
    },
    {
      provide: 'DeleteAssetUseCase',
      useClass: DeleteAssetService,
    },
    {
      provide: 'ListAssetsUseCase',
      useClass: ListAssetsService,
    },
  ],
})
export class AssetModule {}
