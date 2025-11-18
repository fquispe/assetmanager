/**
 * S3Location Value Object
 * Representa la ubicación de un archivo en AWS S3
 */
export class S3Location {
  constructor(
    public readonly bucket: string,
    public readonly key: string,
    public readonly region: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.bucket || this.bucket.trim().length === 0) {
      throw new Error('S3 bucket cannot be empty');
    }

    if (!this.key || this.key.trim().length === 0) {
      throw new Error('S3 key cannot be empty');
    }

    if (!this.region || this.region.trim().length === 0) {
      throw new Error('S3 region cannot be empty');
    }
  }

  /**
   * Retorna la URI completa del objeto en S3
   */
  getUri(): string {
    return `s3://${this.bucket}/${this.key}`;
  }

  /**
   * Retorna la URL de consola de AWS
   */
  getConsoleUrl(): string {
    return `https://s3.console.aws.amazon.com/s3/object/${this.bucket}?region=${this.region}&prefix=${this.key}`;
  }
}
