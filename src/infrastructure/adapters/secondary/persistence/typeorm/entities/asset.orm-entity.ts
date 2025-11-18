import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AssetType } from '@core/domain/enums/asset-type.enum';
import { AssetStatus } from '@core/domain/enums/asset-status.enum';
import { OwnerType } from '@core/domain/enums/owner-type.enum';

/**
 * Entidad ORM para persistencia de activos en PostgreSQL
 * Mapea directamente a la tabla 'assets'
 */
@Entity('assets')
@Index(['assetId'], { where: 'deleted_at IS NULL' })
@Index(['ownerId', 'context'], { where: 'deleted_at IS NULL' })
@Index(['ownerType'], { where: 'deleted_at IS NULL' })
@Index(['status'], { where: 'deleted_at IS NULL' })
@Index(['assetType'], { where: 'deleted_at IS NULL' })
@Index(['uploadedBy'], { where: 'deleted_at IS NULL' })
@Index(['createdAt'], { where: 'deleted_at IS NULL' })
export class AssetOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true, name: 'asset_id' })
  assetId: string;

  // File information
  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'varchar', length: 64, name: 'file_hash' })
  fileHash: string;

  // Asset classification
  @Column({
    type: 'enum',
    enum: AssetType,
    name: 'asset_type',
  })
  assetType: AssetType;

  // S3 location
  @Column({ type: 'varchar', length: 100, name: 's3_bucket' })
  s3Bucket: string;

  @Column({ type: 'varchar', length: 500, name: 's3_key' })
  s3Key: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 's3_region',
    default: 'us-east-1',
  })
  s3Region: string;

  // Business context
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'owner_id' })
  ownerId: string | null;

  @Column({
    type: 'enum',
    enum: OwnerType,
    nullable: true,
    name: 'owner_type',
  })
  ownerType: OwnerType | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  context: string | null;

  // Additional metadata
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // Control and audit
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'uploaded_by' })
  uploadedBy: string | null;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  // Security
  @Column({ type: 'boolean', default: false, name: 'is_public' })
  isPublic: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'expires_at',
  })
  expiresAt: Date | null;

  // Timestamps
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date | null;
}
