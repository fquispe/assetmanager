/**
 * OwnerType Enum
 * Define los tipos de propietarios/entidades que pueden poseer activos
 * Agnóstico al dominio para máxima reutilización
 */
export enum OwnerType {
  USER = 'user',
  PRODUCT = 'product',
  INVOICE = 'invoice',
  CUSTOMER = 'customer',
  ORDER = 'order',
  OTHER = 'other',
}
