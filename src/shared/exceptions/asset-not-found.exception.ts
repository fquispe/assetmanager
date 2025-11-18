import { NotFoundException } from '@nestjs/common';

/**
 * Excepción cuando no se encuentra un activo
 */
export class AssetNotFoundException extends NotFoundException {
  constructor(assetId: string) {
    super(`Asset with id '${assetId}' not found`);
  }
}
