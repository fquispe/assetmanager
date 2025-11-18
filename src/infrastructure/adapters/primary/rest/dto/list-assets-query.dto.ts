import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OwnerType } from '@core/domain/enums/owner-type.enum';
import { AssetStatus } from '@core/domain/enums/asset-status.enum';

/**
 * DTO para query parameters de listado de activos
 */
export class ListAssetsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID del propietario',
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de propietario',
    enum: OwnerType,
    example: OwnerType.USER,
  })
  @IsOptional()
  @IsEnum(OwnerType)
  ownerType?: OwnerType;

  @ApiPropertyOptional({
    description: 'Filtrar por contexto',
    example: 'profile_photo',
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: AssetStatus,
    example: AssetStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tags (separados por coma)',
    example: 'important,profile',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset para paginación',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
