import { BadRequestException } from '@nestjs/common';

/**
 * Excepción cuando el tipo de archivo no es válido
 */
export class InvalidFileTypeException extends BadRequestException {
  constructor(mimeType: string, allowedTypes: string[]) {
    super(
      `Invalid file type '${mimeType}'. Allowed types: ${allowedTypes.join(', ')}`,
    );
  }
}
