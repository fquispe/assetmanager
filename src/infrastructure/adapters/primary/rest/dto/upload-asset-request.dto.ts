import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsObject,
  IsDateString,
} from 'class-validator';
import { OwnerType } from '@core/domain/enums/owner-type.enum';

/**
 * DTO para request de subida de activo
 */
export class UploadAssetRequestDto {
  @ApiPropertyOptional({
    description: 'ID del propietario del activo',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Tipo de propietario',
    enum: OwnerType,
    example: OwnerType.USER,
  })
  @IsOptional()
  @IsEnum(OwnerType)
  ownerType?: OwnerType;

  @ApiPropertyOptional({
    description: 'Contexto de uso del activo',
    example: 'profile_photo',
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que sube el archivo',
    example: 'admin-456',
  })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiPropertyOptional({
    description: 'Tags del activo',
    type: [String],
    example: ['important', 'profile'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    example: { customField: 'value' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Fecha de expiración del activo (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
