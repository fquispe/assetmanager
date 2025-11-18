import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import {
  FileStoragePort,
  UploadFileOptions,
  UploadFileResult,
  PresignedUrlOptions,
} from '@core/ports/outbound/file-storage.port';
import { S3Location } from '@core/domain/value-objects/s3-location.vo';
import { AssetType } from '@core/domain/enums/asset-type.enum';

/**
 * Adaptador de almacenamiento de archivos usando AWS S3
 * Implementa el port FileStoragePort
 */
@Injectable()
export class S3FileStorageAdapter implements FileStoragePort {
  private readonly s3: AWS.S3;
  private readonly imagesBucket: string;
  private readonly documentsBucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');

    this.s3 = new AWS.S3({
      region: this.region,
      accessKeyId,
      secretAccessKey,
      signatureVersion: 'v4',
    });

    this.imagesBucket = this.configService.get<string>('S3_IMAGES_BUCKET')!;
    this.documentsBucket =
      this.configService.get<string>('S3_DOCUMENTS_BUCKET')!;

    if (!this.imagesBucket || !this.documentsBucket) {
      throw new Error('S3 buckets not configured properly');
    }
  }

  async uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
    const bucket = this.getBucketForAssetType(options.assetType);

    // Generar key (path) en S3
    const key = this.generateS3Key(options.fileName, options.assetType);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: key,
      Body: options.buffer,
      ContentType: options.mimeType,
      Metadata: options.metadata || {},
      ServerSideEncryption: 'AES256', // Encriptación en reposo
    };

    try {
      const result = await this.s3.upload(params).promise();

      const s3Location = new S3Location(bucket, key, this.region);

      return {
        s3Location,
        eTag: result.ETag,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload file to S3: ${(error as Error).message}`,
      );
    }
  }

  async downloadFile(s3Location: S3Location): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: s3Location.bucket,
      Key: s3Location.key,
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      throw new Error(
        `Failed to download file from S3: ${(error as Error).message}`,
      );
    }
  }

  async generatePresignedUrl(
    s3Location: S3Location,
    options?: PresignedUrlOptions,
  ): Promise<string> {
    const params: any = {
      Bucket: s3Location.bucket,
      Key: s3Location.key,
      Expires: options?.expiresIn || 3600, // 1 hora por defecto
    };

    if (options?.responseContentType) {
      params.ResponseContentType = options.responseContentType;
    }

    if (options?.responseContentDisposition) {
      params.ResponseContentDisposition = options.responseContentDisposition;
    }

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      throw new Error(
        `Failed to generate presigned URL: ${(error as Error).message}`,
      );
    }
  }

  async deleteFile(s3Location: S3Location): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: s3Location.bucket,
      Key: s3Location.key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(
        `Failed to delete file from S3: ${(error as Error).message}`,
      );
    }
  }

  async fileExists(s3Location: S3Location): Promise<boolean> {
    const params: AWS.S3.HeadObjectRequest = {
      Bucket: s3Location.bucket,
      Key: s3Location.key,
    };

    try {
      await this.s3.headObject(params).promise();
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw new Error(
        `Failed to check if file exists: ${(error as Error).message}`,
      );
    }
  }

  getBucketForAssetType(assetType: AssetType): string {
    return assetType === AssetType.IMAGE
      ? this.imagesBucket
      : this.documentsBucket;
  }

  /**
   * Genera la key (path) en S3 para un archivo
   * Estructura: {tipo}/{año}/{mes}/{nombre_archivo}
   */
  private generateS3Key(fileName: string, assetType: AssetType): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const typeFolder = assetType === AssetType.IMAGE ? 'images' : 'documents';

    return `${typeFolder}/${year}/${month}/${fileName}`;
  }
}
