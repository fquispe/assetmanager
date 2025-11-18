import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './infrastructure/config/database.config';
import s3Config from './infrastructure/config/s3.config';
import appConfig from './infrastructure/config/app.config';
import { AssetModule } from './infrastructure/modules/asset.module';

/**
 * Módulo raíz de la aplicación
 */
@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, s3Config, appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Módulo de negocio principal
    AssetModule,
  ],
})
export class AppModule {}
