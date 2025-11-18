import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AssetRepositoryPort,
  AssetFilters,
  PaginatedAssets,
} from '@core/ports/outbound/asset-repository.port';
import { Asset } from '@core/domain/entities/asset.entity';
import { AssetId } from '@core/domain/value-objects/asset-id.vo';
import { FileMetadata } from '@core/domain/value-objects/file-metadata.vo';
import { S3Location } from '@core/domain/value-objects/s3-location.vo';
import { AssetOrmEntity } from './entities/asset.orm-entity';

/**
 * Implementación del repositorio de activos usando TypeORM y PostgreSQL
 */
@Injectable()
export class AssetRepository implements AssetRepositoryPort {
  constructor(
    @InjectRepository(AssetOrmEntity)
    private readonly repository: Repository<AssetOrmEntity>,
  ) {}

  async save(asset: Asset): Promise<Asset> {
    const ormEntity = this.mapToOrmEntity(asset);
    const savedEntity = await this.repository.save(ormEntity);
    return this.mapToDomain(savedEntity);
  }

  async findById(assetId: AssetId): Promise<Asset | null> {
    const entity = await this.repository.findOne({
      where: {
        assetId: assetId.toString(),
        deletedAt: null,
      },
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  async findWithFilters(filters: AssetFilters): Promise<PaginatedAssets> {
    const queryBuilder = this.repository
      .createQueryBuilder('asset')
      .where('asset.deleted_at IS NULL');

    // Aplicar filtros
    if (filters.ownerId) {
      queryBuilder.andWhere('asset.owner_id = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters.ownerType) {
      queryBuilder.andWhere('asset.owner_type = :ownerType', {
        ownerType: filters.ownerType,
      });
    }

    if (filters.context) {
      queryBuilder.andWhere('asset.context = :context', {
        context: filters.context,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('asset.status = :status', {
        status: filters.status,
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('asset.tags && :tags', {
        tags: filters.tags,
      });
    }

    // Ordenar por fecha de creación (más reciente primero)
    queryBuilder.orderBy('asset.created_at', 'DESC');

    // Paginación
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    queryBuilder.skip(offset).take(limit);

    // Ejecutar query
    const [entities, total] = await queryBuilder.getManyAndCount();

    const assets = entities.map((entity) => this.mapToDomain(entity));

    return {
      assets,
      total,
      limit,
      offset,
    };
  }

  async update(asset: Asset): Promise<Asset> {
    const ormEntity = this.mapToOrmEntity(asset);

    // Encontrar el ID interno (PK)
    const existing = await this.repository.findOne({
      where: { assetId: asset.assetId.toString() },
    });

    if (!existing) {
      throw new Error(`Asset with id ${asset.assetId.toString()} not found`);
    }

    ormEntity.id = existing.id;

    const updatedEntity = await this.repository.save(ormEntity);
    return this.mapToDomain(updatedEntity);
  }

  async delete(assetId: AssetId): Promise<void> {
    await this.repository.update(
      { assetId: assetId.toString() },
      { deletedAt: new Date() },
    );
  }

  async existsByHash(fileHash: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        fileHash,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async findByHash(fileHash: string): Promise<Asset | null> {
    const entity = await this.repository.findOne({
      where: {
        fileHash,
        deletedAt: null,
      },
    });

    return entity ? this.mapToDomain(entity) : null;
  }

  /**
   * Mapea una entidad de dominio a entidad ORM
   */
  private mapToOrmEntity(asset: Asset): AssetOrmEntity {
    const ormEntity = new AssetOrmEntity();

    ormEntity.assetId = asset.assetId.toString();
    ormEntity.fileName = asset.fileMetadata.fileName;
    ormEntity.originalName = asset.fileMetadata.originalName;
    ormEntity.mimeType = asset.fileMetadata.mimeType;
    ormEntity.fileSize = asset.fileMetadata.fileSize;
    ormEntity.fileHash = asset.fileMetadata.fileHash;
    ormEntity.assetType = asset.fileMetadata.assetType;
    ormEntity.s3Bucket = asset.s3Location.bucket;
    ormEntity.s3Key = asset.s3Location.key;
    ormEntity.s3Region = asset.s3Location.region;
    ormEntity.ownerId = asset.ownerId || null;
    ormEntity.ownerType = asset.ownerType || null;
    ormEntity.context = asset.context || null;
    ormEntity.tags = asset.tags;
    ormEntity.metadata = asset.metadata;
    ormEntity.uploadedBy = asset.uploadedBy || null;
    ormEntity.status = asset.status;
    ormEntity.isPublic = asset.isPublic;
    ormEntity.expiresAt = asset.expiresAt || null;
    ormEntity.createdAt = asset.createdAt;
    ormEntity.updatedAt = asset.updatedAt;
    ormEntity.deletedAt = asset.deletedAt || null;

    return ormEntity;
  }

  /**
   * Mapea una entidad ORM a entidad de dominio
   */
  private mapToDomain(ormEntity: AssetOrmEntity): Asset {
    const fileMetadata = new FileMetadata(
      ormEntity.fileName,
      ormEntity.originalName,
      ormEntity.mimeType,
      Number(ormEntity.fileSize),
      ormEntity.fileHash,
      ormEntity.assetType,
    );

    const s3Location = new S3Location(
      ormEntity.s3Bucket,
      ormEntity.s3Key,
      ormEntity.s3Region,
    );

    return Asset.fromPersistence(
      ormEntity.assetId,
      fileMetadata,
      s3Location,
      ormEntity.ownerId || undefined,
      ormEntity.ownerType || undefined,
      ormEntity.context || undefined,
      ormEntity.tags || [],
      ormEntity.metadata || {},
      ormEntity.uploadedBy || undefined,
      ormEntity.status,
      ormEntity.isPublic,
      ormEntity.expiresAt || undefined,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.deletedAt || undefined,
    );
  }
}
