import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

// Use Cases
import { UploadAssetUseCase } from '@core/ports/inbound/upload-asset.use-case';
import { GetAssetUseCase } from '@core/ports/inbound/get-asset.use-case';
import { GetAssetMetadataUseCase } from '@core/ports/inbound/get-asset-metadata.use-case';
import { DeleteAssetUseCase } from '@core/ports/inbound/delete-asset.use-case';
import { ListAssetsUseCase } from '@core/ports/inbound/list-assets.use-case';

// DTOs
import { UploadAssetRequestDto } from './dto/upload-asset-request.dto';
import { ListAssetsQueryDto } from './dto/list-assets-query.dto';

/**
 * Controlador REST para gestión de activos
 * Expone los endpoints de la API
 */
@ApiTags('Assets')
@Controller('assets')
export class AssetController {
  constructor(
    @Inject('UploadAssetUseCase')
    private readonly uploadAssetUseCase: UploadAssetUseCase,
    @Inject('GetAssetUseCase')
    private readonly getAssetUseCase: GetAssetUseCase,
    @Inject('GetAssetMetadataUseCase')
    private readonly getAssetMetadataUseCase: GetAssetMetadataUseCase,
    @Inject('DeleteAssetUseCase')
    private readonly deleteAssetUseCase: DeleteAssetUseCase,
    @Inject('ListAssetsUseCase')
    private readonly listAssetsUseCase: ListAssetsUseCase,
  ) {}

  /**
   * POST /assets - Subir un nuevo activo
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir un nuevo activo',
    description:
      'Sube un archivo (imagen o documento) al sistema. El archivo se almacena en S3 y sus metadatos en PostgreSQL.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (imagen o documento)',
        },
        ownerId: {
          type: 'string',
          description: 'ID del propietario',
          example: 'user-123',
        },
        ownerType: {
          type: 'string',
          enum: ['user', 'product', 'invoice', 'customer', 'order', 'other'],
          description: 'Tipo de propietario',
        },
        context: {
          type: 'string',
          description: 'Contexto de uso',
          example: 'profile_photo',
        },
        uploadedBy: {
          type: 'string',
          description: 'ID del usuario que sube',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags del activo',
        },
        metadata: {
          type: 'object',
          description: 'Metadatos adicionales',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Fecha de expiración',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Activo subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string', example: 'a1b2c3d4-e5f6-...' },
        fileName: { type: 'string', example: '1234567890_abc123.jpg' },
        fileSize: { type: 'number', example: 256000 },
        mimeType: { type: 'string', example: 'image/jpeg' },
        assetType: { type: 'string', example: 'image' },
        s3Location: {
          type: 'string',
          example: 's3://my-bucket/images/2024/01/file.jpg',
        },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Tipo de archivo inválido o archivo muy grande' })
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAssetRequestDto,
  ) {
    const result = await this.uploadAssetUseCase.execute({
      file: {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
      ownerId: dto.ownerId,
      ownerType: dto.ownerType,
      context: dto.context,
      uploadedBy: dto.uploadedBy,
      tags: dto.tags,
      metadata: dto.metadata,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return result;
  }

  /**
   * GET /assets/:assetId - Obtener/Descargar un activo
   */
  @Get(':assetId')
  @ApiOperation({
    summary: 'Obtener/Descargar un activo',
    description:
      'Retorna una URL pre-firmada de S3 para descargar el archivo de forma segura.',
  })
  @ApiParam({
    name: 'assetId',
    description: 'ID único del activo',
    example: 'a1b2c3d4-e5f6-...',
  })
  @ApiResponse({
    status: 200,
    description: 'URL pre-firmada generada',
    schema: {
      type: 'object',
      properties: {
        presignedUrl: {
          type: 'string',
          example: 'https://s3.amazonaws.com/...',
        },
        fileName: { type: 'string', example: 'document.pdf' },
        mimeType: { type: 'string', example: 'application/pdf' },
        expiresIn: { type: 'number', example: 3600 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  @ApiResponse({ status: 400, description: 'Activo no disponible o expirado' })
  async getAsset(@Param('assetId') assetId: string) {
    return await this.getAssetUseCase.execute({ assetId });
  }

  /**
   * GET /assets/:assetId/metadata - Obtener metadatos de un activo
   */
  @Get(':assetId/metadata')
  @ApiOperation({
    summary: 'Obtener metadatos de un activo',
    description:
      'Retorna información detallada del activo sin descargar el archivo.',
  })
  @ApiParam({
    name: 'assetId',
    description: 'ID único del activo',
    example: 'a1b2c3d4-e5f6-...',
  })
  @ApiResponse({
    status: 200,
    description: 'Metadatos del activo',
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string' },
        fileName: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        fileSize: { type: 'number' },
        fileSizeReadable: { type: 'string', example: '256.00 KB' },
        fileHash: { type: 'string' },
        assetType: { type: 'string' },
        s3Bucket: { type: 'string' },
        s3Key: { type: 'string' },
        s3Region: { type: 'string' },
        ownerId: { type: 'string', nullable: true },
        ownerType: { type: 'string', nullable: true },
        context: { type: 'string', nullable: true },
        tags: { type: 'array', items: { type: 'string' } },
        metadata: { type: 'object' },
        uploadedBy: { type: 'string', nullable: true },
        status: { type: 'string' },
        isPublic: { type: 'boolean' },
        expiresAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async getAssetMetadata(@Param('assetId') assetId: string) {
    return await this.getAssetMetadataUseCase.execute({ assetId });
  }

  /**
   * DELETE /assets/:assetId - Eliminar un activo
   */
  @Delete(':assetId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un activo',
    description:
      'Elimina un activo del sistema (soft delete en BD y eliminación física en S3).',
  })
  @ApiParam({
    name: 'assetId',
    description: 'ID único del activo',
    example: 'a1b2c3d4-e5f6-...',
  })
  @ApiResponse({
    status: 200,
    description: 'Activo eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        assetId: { type: 'string' },
        deleted: { type: 'boolean', example: true },
        deletedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async deleteAsset(@Param('assetId') assetId: string) {
    return await this.deleteAssetUseCase.execute({ assetId });
  }

  /**
   * GET /assets - Listar/Buscar activos
   */
  @Get()
  @ApiOperation({
    summary: 'Listar/Buscar activos',
    description: 'Retorna una lista paginada de activos con filtros opcionales.',
  })
  @ApiQuery({ type: ListAssetsQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Lista de activos',
    schema: {
      type: 'object',
      properties: {
        assets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              assetId: { type: 'string' },
              fileName: { type: 'string' },
              originalName: { type: 'string' },
              mimeType: { type: 'string' },
              fileSize: { type: 'number' },
              fileSizeReadable: { type: 'string' },
              assetType: { type: 'string' },
              ownerId: { type: 'string', nullable: true },
              ownerType: { type: 'string', nullable: true },
              context: { type: 'string', nullable: true },
              tags: { type: 'array', items: { type: 'string' } },
              status: { type: 'string' },
              uploadedBy: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        total: { type: 'number', example: 100 },
        limit: { type: 'number', example: 20 },
        offset: { type: 'number', example: 0 },
        hasMore: { type: 'boolean', example: true },
      },
    },
  })
  async listAssets(@Query() query: ListAssetsQueryDto) {
    return await this.listAssetsUseCase.execute({
      ownerId: query.ownerId,
      ownerType: query.ownerType,
      context: query.context,
      status: query.status,
      tags: query.tags ? query.tags.split(',') : undefined,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
