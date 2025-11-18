# AssetManager - Microservicio de Gestión de Activos Digitales

Microservicio centralizado para la gestión del ciclo de vida completo de activos digitales (imágenes, documentos PDF, etc.), diseñado con **arquitectura hexagonal** y **NestJS**, desplegable en **AWS Lambda**.

## 🎯 Características Principales

- ✅ **Arquitectura Hexagonal** (Ports & Adapters) para máxima desacoplamiento y mantenibilidad
- ✅ **Almacenamiento en AWS S3** con buckets separados para imágenes y documentos
- ✅ **Base de datos PostgreSQL** para persistencia de metadatos
- ✅ **URLs pre-firmadas** para descarga segura de archivos
- ✅ **Validación de archivos** (tipo MIME, tamaño)
- ✅ **Deduplicación** mediante hash SHA256
- ✅ **Soft delete** para recuperación de archivos
- ✅ **API REST** con documentación Swagger/OpenAPI
- ✅ **Agnóstico al dominio** - Reutilizable en múltiples plataformas
- ✅ **Desplegable en AWS Lambda** con Serverless Framework

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🏗 Arquitectura

El proyecto sigue **Arquitectura Hexagonal** (también conocida como Ports & Adapters):

```
┌─────────────────────────────────────────────────────────┐
│                    API REST (Primary Adapter)           │
│                     AssetController                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│               Application Layer (Use Cases)             │
│  UploadAsset │ GetAsset │ GetMetadata │ Delete │ List  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Domain Layer (Core)                   │
│        Entities │ Value Objects │ Business Rules        │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌────────▼────────┐    ┌────────▼─────────┐
│ PostgreSQL      │    │   AWS S3         │
│ (Repository)    │    │ (File Storage)   │
└─────────────────┘    └──────────────────┘
```

### Capas:

1. **Domain (Core)**: Entidades, Value Objects, reglas de negocio
2. **Application**: Casos de uso (servicios de aplicación)
3. **Infrastructure**: Adaptadores (PostgreSQL, S3, REST Controllers)

---

## ⚙️ Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Cuenta AWS** con acceso a S3
- **AWS CLI** configurado (opcional, para despliegue)
- **Serverless Framework** (opcional, para despliegue Lambda)

---

## 📦 Instalación

1. **Clonar el repositorio** (o usar el código generado):

```bash
cd assetmanager
```

2. **Instalar dependencias**:

```bash
npm install
```

3. **Configurar base de datos PostgreSQL**:

Ejecutar el script SQL de migración:

```bash
psql -U your_user -d assetmanager_db -f database/migrations/001_create_assets_table.sql
```

O crear manualmente la base de datos y ejecutar el script:

```sql
CREATE DATABASE assetmanager_db;
```

4. **Configurar variables de entorno**:

Copiar `.env.example` a `.env` y configurar:

```bash
cp .env.example .env
```

---

## 🔧 Configuración

Editar el archivo `.env` con tus valores:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=AssetManager

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=assetmanager
DB_PASSWORD=tu_password_seguro
DB_DATABASE=assetmanager_db
DB_SYNCHRONIZE=false
DB_LOGGING=true

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key

# S3 Buckets
S3_IMAGES_BUCKET=nombre-bucket-imagenes
S3_DOCUMENTS_BUCKET=nombre-bucket-documentos

# File Upload Limits (en bytes)
MAX_FILE_SIZE_IMAGE=10485760      # 10MB
MAX_FILE_SIZE_DOCUMENT=52428800   # 50MB

# Presigned URL Expiration (en segundos)
PRESIGNED_URL_EXPIRATION=3600     # 1 hora

# Allowed MIME Types
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/svg+xml
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Configuración de AWS S3

Asegúrate de que tus buckets de S3:
- Están creados en la región especificada
- **NO son públicos** (acceso privado)
- Tienen las políticas IAM correctas para permitir acceso desde la aplicación

---

## 🚀 Uso

### Desarrollo Local

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo producción local
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000`

Documentación Swagger: `http://localhost:3000/api/docs`

### Testing Local con Serverless Offline

```bash
npm install -g serverless
serverless offline
```

---

## 📡 API Endpoints

### 1. **POST** `/assets` - Subir un activo

Sube un archivo (imagen o documento) al sistema.

**Request:**
```http
POST /assets
Content-Type: multipart/form-data

file: [archivo binario]
ownerId: "user-123"
ownerType: "user"
context: "profile_photo"
uploadedBy: "admin-456"
tags: ["important", "profile"]
metadata: {"customField": "value"}
```

**Response (201):**
```json
{
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fileName": "1234567890_abc123.jpg",
  "fileSize": 256000,
  "mimeType": "image/jpeg",
  "assetType": "image",
  "s3Location": "s3://my-images-bucket/images/2024/01/1234567890_abc123.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**⚠️ Importante:** El cliente debe guardar el `assetId` retornado en su base de datos para futuras consultas.

---

### 2. **GET** `/assets/{assetId}` - Obtener/Descargar activo

Retorna una URL pre-firmada de S3 para descargar el archivo de forma segura.

**Request:**
```http
GET /assets/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response (200):**
```json
{
  "presignedUrl": "https://my-images-bucket.s3.amazonaws.com/images/2024/01/file.jpg?X-Amz-Algorithm=...",
  "fileName": "avatar.jpg",
  "mimeType": "image/jpeg",
  "expiresIn": 3600
}
```

El cliente debe usar la `presignedUrl` para descargar el archivo directamente desde S3.

---

### 3. **GET** `/assets/{assetId}/metadata` - Obtener metadatos

Retorna información detallada del activo sin descargar el archivo.

**Request:**
```http
GET /assets/a1b2c3d4-e5f6-7890-abcd-ef1234567890/metadata
```

**Response (200):**
```json
{
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fileName": "1234567890_abc123.jpg",
  "originalName": "avatar.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 256000,
  "fileSizeReadable": "250.00 KB",
  "fileHash": "a1b2c3d4e5f6...",
  "assetType": "image",
  "s3Bucket": "my-images-bucket",
  "s3Key": "images/2024/01/1234567890_abc123.jpg",
  "s3Region": "us-east-1",
  "ownerId": "user-123",
  "ownerType": "user",
  "context": "profile_photo",
  "tags": ["important", "profile"],
  "metadata": {"customField": "value"},
  "uploadedBy": "admin-456",
  "status": "active",
  "isPublic": false,
  "expiresAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 4. **DELETE** `/assets/{assetId}` - Eliminar activo

Elimina un activo (soft delete en BD, eliminación física en S3).

**Request:**
```http
DELETE /assets/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response (200):**
```json
{
  "assetId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "deleted": true,
  "deletedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 5. **GET** `/assets` - Listar/Buscar activos

Retorna una lista paginada de activos con filtros opcionales.

**Request:**
```http
GET /assets?ownerId=user-123&context=profile_photo&limit=20&offset=0
```

**Query Parameters:**
- `ownerId` (opcional): Filtrar por ID del propietario
- `ownerType` (opcional): Filtrar por tipo de propietario
- `context` (opcional): Filtrar por contexto
- `status` (opcional): Filtrar por estado
- `tags` (opcional): Filtrar por tags (separados por coma)
- `limit` (opcional): Límite de resultados (1-100, default: 20)
- `offset` (opcional): Offset para paginación (default: 0)

**Response (200):**
```json
{
  "assets": [
    {
      "assetId": "a1b2c3d4-...",
      "fileName": "1234567890_abc123.jpg",
      "originalName": "avatar.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 256000,
      "fileSizeReadable": "250.00 KB",
      "assetType": "image",
      "ownerId": "user-123",
      "ownerType": "user",
      "context": "profile_photo",
      "tags": ["important"],
      "status": "active",
      "uploadedBy": "admin-456",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

---

## 🚢 Despliegue

### Despliegue en AWS Lambda

1. **Instalar Serverless Framework**:

```bash
npm install -g serverless
```

2. **Configurar credenciales AWS**:

```bash
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
```

3. **Configurar variables de entorno** en `serverless.yml` o usar AWS Systems Manager Parameter Store.

4. **Desplegar**:

```bash
# Despliegue en desarrollo
npm run deploy:dev

# Despliegue en producción
npm run deploy:prod

# O directamente con serverless
serverless deploy --stage prod --region us-east-1
```

5. **Ver información del despliegue**:

```bash
serverless info
```

### Configuración de VPC (si usas RDS)

Si tu PostgreSQL está en una VPC, descomenta y configura la sección `vpc` en `serverless.yml`:

```yaml
vpc:
  securityGroupIds:
    - sg-xxxxxxxxx
  subnetIds:
    - subnet-xxxxxxxxx
    - subnet-yyyyyyyyy
```

---

## 📁 Estructura del Proyecto

```
assetmanager/
├── src/
│   ├── core/                          # Capa de Dominio
│   │   ├── domain/
│   │   │   ├── entities/              # Entidades de negocio
│   │   │   │   └── asset.entity.ts
│   │   │   ├── value-objects/         # Value Objects
│   │   │   │   ├── asset-id.vo.ts
│   │   │   │   ├── file-metadata.vo.ts
│   │   │   │   └── s3-location.vo.ts
│   │   │   └── enums/                 # Enumeraciones
│   │   │       ├── asset-type.enum.ts
│   │   │       ├── asset-status.enum.ts
│   │   │       └── owner-type.enum.ts
│   │   └── ports/                     # Interfaces (Ports)
│   │       ├── inbound/               # Primary Ports (Use Cases)
│   │       │   ├── upload-asset.use-case.ts
│   │       │   ├── get-asset.use-case.ts
│   │       │   ├── get-asset-metadata.use-case.ts
│   │       │   ├── delete-asset.use-case.ts
│   │       │   └── list-assets.use-case.ts
│   │       └── outbound/              # Secondary Ports
│   │           ├── asset-repository.port.ts
│   │           └── file-storage.port.ts
│   ├── application/                   # Capa de Aplicación
│   │   └── use-cases/                 # Implementación de casos de uso
│   │       ├── upload-asset.service.ts
│   │       ├── get-asset.service.ts
│   │       ├── get-asset-metadata.service.ts
│   │       ├── delete-asset.service.ts
│   │       └── list-assets.service.ts
│   ├── infrastructure/                # Capa de Infraestructura
│   │   ├── adapters/
│   │   │   ├── primary/               # Primary Adapters
│   │   │   │   └── rest/
│   │   │   │       ├── asset.controller.ts
│   │   │   │       └── dto/
│   │   │   │           ├── upload-asset-request.dto.ts
│   │   │   │           └── list-assets-query.dto.ts
│   │   │   └── secondary/             # Secondary Adapters
│   │   │       ├── persistence/
│   │   │       │   └── typeorm/
│   │   │       │       ├── entities/
│   │   │       │       │   └── asset.orm-entity.ts
│   │   │       │       └── asset.repository.ts
│   │   │       └── storage/
│   │   │           └── s3/
│   │   │               └── s3-file-storage.adapter.ts
│   │   ├── config/                    # Configuraciones
│   │   │   ├── database.config.ts
│   │   │   ├── s3.config.ts
│   │   │   └── app.config.ts
│   │   └── modules/                   # Módulos NestJS
│   │       ├── asset.module.ts
│   │       ├── database.module.ts
│   │       └── storage.module.ts
│   ├── shared/                        # Código compartido
│   │   ├── exceptions/
│   │   │   ├── asset-not-found.exception.ts
│   │   │   └── invalid-file-type.exception.ts
│   │   └── utils/
│   │       ├── file-validator.util.ts
│   │       └── hash.util.ts
│   ├── app.module.ts                  # Módulo raíz
│   ├── main.ts                        # Entry point (local)
│   └── lambda.ts                      # Lambda handler
├── database/
│   └── migrations/
│       └── 001_create_assets_table.sql
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
├── serverless.yml
└── README.md
```

---

## 🔒 Seguridad

- ✅ Buckets S3 **privados** (no acceso público)
- ✅ URLs pre-firmadas con **expiración configurable**
- ✅ Validación de **tipo MIME** y **tamaño** de archivos
- ✅ **Encriptación en reposo** en S3 (AES256)
- ✅ **Soft delete** para recuperación de datos
- ✅ Validación de entrada con **class-validator**

---

## 📝 Casos de Uso Comunes

### 1. Foto de Perfil de Usuario

```typescript
// Cliente (app web/móvil) sube foto de perfil
POST /assets
file: photo.jpg
ownerId: "user-123"
ownerType: "user"
context: "profile_photo"

// Respuesta
{
  "assetId": "abc-123",
  ...
}

// Cliente guarda "abc-123" en su tabla users.profile_photo_id
```

### 2. Factura de Cliente

```typescript
// Sistema de facturación sube factura PDF
POST /assets
file: invoice.pdf
ownerId: "invoice-456"
ownerType: "invoice"
context: "invoice_document"

// Cliente puede luego obtener URL de descarga
GET /assets/xyz-789
```

---

## 🛠 Tecnologías Utilizadas

- **NestJS** - Framework backend
- **TypeScript** - Lenguaje
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **AWS S3** - Almacenamiento de archivos
- **AWS Lambda** - Serverless compute
- **Serverless Framework** - Gestión de infraestructura
- **Swagger/OpenAPI** - Documentación de API
- **class-validator** - Validación de DTOs

---

## 📄 Licencia

MIT
