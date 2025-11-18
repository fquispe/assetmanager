import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

/**
 * AssetId Value Object
 * Representa el identificador único de un activo
 */
export class AssetId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Crea un nuevo AssetId con un UUID generado
   */
  static create(): AssetId {
    return new AssetId(uuidv4());
  }

  /**
   * Crea un AssetId desde un string existente
   */
  static fromString(value: string): AssetId {
    if (!uuidValidate(value)) {
      throw new Error(`Invalid AssetId format: ${value}`);
    }
    return new AssetId(value);
  }

  /**
   * Retorna el valor del AssetId como string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Compara dos AssetId
   */
  equals(other: AssetId): boolean {
    return this.value === other.value;
  }
}
