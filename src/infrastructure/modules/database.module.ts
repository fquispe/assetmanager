import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AssetOrmEntity } from '../adapters/secondary/persistence/typeorm/entities/asset.orm-entity';
import { AssetRepository } from '../adapters/secondary/persistence/typeorm/asset.repository';

/**
 * Módulo de base de datos
 * Configura TypeORM y provee el repositorio de activos
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [AssetOrmEntity],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AssetOrmEntity]),
  ],
  providers: [
    {
      provide: 'AssetRepositoryPort',
      useClass: AssetRepository,
    },
  ],
  exports: ['AssetRepositoryPort'],
})
export class DatabaseModule {}
