import { AssetId } from '../value-objects/asset-id.vo';
import { FileMetadata } from '../value-objects/file-metadata.vo';
import { S3Location } from '../value-objects/s3-location.vo';
import { AssetStatus } from '../enums/asset-status.enum';
import { OwnerType } from '../enums/owner-type.enum';

/**
 * Asset Entity (Aggregate Root)
 * Representa un activo digital en el sistema
 * Encapsula todas las reglas de negocio relacionadas con activos
 */
export class Asset {
  private constructor(
    private readonly _assetId: AssetId,
    private readonly _fileMetadata: FileMetadata,
    private readonly _s3Location: S3Location,
    private _ownerId?: string,
    private _ownerType?: OwnerType,
    private _context?: string,
    private _tags: string[] = [],
    private _metadata: Record<string, any> = {},
    private _uploadedBy?: string,
    private _status: AssetStatus = AssetStatus.PROCESSING,
    private _isPublic: boolean = false,
    private _expiresAt?: Date,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _deletedAt?: Date,
  ) {}

  /**
   * Factory method para crear un nuevo Asset
   */
  static create(
    fileMetadata: FileMetadata,
    s3Location: S3Location,
    ownerId?: string,
    ownerType?: OwnerType,
    context?: string,
    uploadedBy?: string,
    tags: string[] = [],
    metadata: Record<string, any> = {},
  ): Asset {
    const asset = new Asset(
      AssetId.create(),
      fileMetadata,
      s3Location,
      ownerId,
      ownerType,
      context,
      tags,
      metadata,
      uploadedBy,
      AssetStatus.PROCESSING,
    );

    return asset;
  }

  /**
   * Factory method para reconstruir un Asset desde persistencia
   */
  static fromPersistence(
    assetId: string,
    fileMetadata: FileMetadata,
    s3Location: S3Location,
    ownerId: string | undefined,
    ownerType: OwnerType | undefined,
    context: string | undefined,
    tags: string[],
    metadata: Record<string, any>,
    uploadedBy: string | undefined,
    status: AssetStatus,
    isPublic: boolean,
    expiresAt: Date | undefined,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | undefined,
  ): Asset {
    return new Asset(
      AssetId.fromString(assetId),
      fileMetadata,
      s3Location,
      ownerId,
      ownerType,
      context,
      tags,
      metadata,
      uploadedBy,
      status,
      isPublic,
      expiresAt,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  // ==================== Business Methods ====================

  /**
   * Marca el activo como activo (completada la carga)
   */
  markAsActive(): void {
    if (this._status === AssetStatus.DELETED) {
      throw new Error('Cannot activate a deleted asset');
    }
    this._status = AssetStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  /**
   * Marca el activo como eliminado (soft delete)
   */
  delete(): void {
    if (this._status === AssetStatus.DELETED) {
      throw new Error('Asset is already deleted');
    }
    this._status = AssetStatus.DELETED;
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Verifica si el activo ha expirado
   */
  isExpired(): boolean {
    if (!this._expiresAt) {
      return false;
    }
    return new Date() > this._expiresAt;
  }

  /**
   * Marca el activo como expirado si corresponde
   */
  checkAndMarkExpired(): void {
    if (this.isExpired() && this._status === AssetStatus.ACTIVE) {
      this._status = AssetStatus.EXPIRED;
      this._updatedAt = new Date();
    }
  }

  /**
   * Agrega tags al activo
   */
  addTags(tags: string[]): void {
    this._tags = [...new Set([...this._tags, ...tags])];
    this._updatedAt = new Date();
  }

  /**
   * Actualiza metadatos del activo
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updatedAt = new Date();
  }

  /**
   * Establece fecha de expiración
   */
  setExpirationDate(expiresAt: Date): void {
    if (expiresAt <= new Date()) {
      throw new Error('Expiration date must be in the future');
    }
    this._expiresAt = expiresAt;
    this._updatedAt = new Date();
  }

  /**
   * Verifica si el activo está disponible para descarga
   */
  isAvailable(): boolean {
    return (
      this._status === AssetStatus.ACTIVE &&
      !this.isDeleted() &&
      !this.isExpired()
    );
  }

  /**
   * Verifica si el activo está eliminado
   */
  isDeleted(): boolean {
    return this._status === AssetStatus.DELETED || !!this._deletedAt;
  }

  // ==================== Getters ====================

  get assetId(): AssetId {
    return this._assetId;
  }

  get fileMetadata(): FileMetadata {
    return this._fileMetadata;
  }

  get s3Location(): S3Location {
    return this._s3Location;
  }

  get ownerId(): string | undefined {
    return this._ownerId;
  }

  get ownerType(): OwnerType | undefined {
    return this._ownerType;
  }

  get context(): string | undefined {
    return this._context;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  get uploadedBy(): string | undefined {
    return this._uploadedBy;
  }

  get status(): AssetStatus {
    return this._status;
  }

  get isPublic(): boolean {
    return this._isPublic;
  }

  get expiresAt(): Date | undefined {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }
}
