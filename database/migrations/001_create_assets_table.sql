-- =====================================================
-- Asset Manager Microservice - PostgreSQL Schema
-- Migration: 001_create_assets_table
-- Description: Tabla principal para almacenar metadatos de activos digitales
-- =====================================================

-- Create ENUM types
CREATE TYPE asset_type AS ENUM ('image', 'document');
CREATE TYPE asset_status AS ENUM ('active', 'processing', 'deleted', 'expired');
CREATE TYPE owner_type AS ENUM ('user', 'product', 'invoice', 'customer', 'order', 'other');

-- Create main assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,

    -- Identificador único para exposición externa
    asset_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Información del archivo
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- tamaño en bytes
    file_hash VARCHAR(64) NOT NULL, -- SHA256

    -- Clasificación del archivo
    asset_type asset_type NOT NULL,

    -- Ubicación en S3
    s3_bucket VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_region VARCHAR(50) NOT NULL DEFAULT 'us-east-1',

    -- Contexto de negocio (reutilización entre plataformas)
    owner_id VARCHAR(100), -- ID del propietario (usuario, producto, etc.)
    owner_type owner_type, -- Tipo de propietario
    context VARCHAR(100), -- Contexto: 'profile_photo', 'invoice', 'product_image', etc.

    -- Metadatos adicionales (JSONB para flexibilidad)
    tags TEXT[], -- Array de tags
    metadata JSONB DEFAULT '{}', -- Metadatos flexibles adicionales

    -- Control y auditoría
    uploaded_by VARCHAR(100), -- ID del usuario que subió el archivo
    status asset_status NOT NULL DEFAULT 'active',

    -- Seguridad y acceso
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL si no expira

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- =====================================================
-- Indexes para optimizar consultas
-- =====================================================

-- Índice único en asset_id (ya creado por UNIQUE constraint)
CREATE INDEX idx_assets_asset_id ON assets(asset_id) WHERE deleted_at IS NULL;

-- Índice para búsquedas por owner_id y context (caso de uso común)
CREATE INDEX idx_assets_owner_context ON assets(owner_id, context) WHERE deleted_at IS NULL;

-- Índice para búsquedas por owner_type
CREATE INDEX idx_assets_owner_type ON assets(owner_type) WHERE deleted_at IS NULL;

-- Índice para búsquedas por status
CREATE INDEX idx_assets_status ON assets(status) WHERE deleted_at IS NULL;

-- Índice para búsquedas por asset_type
CREATE INDEX idx_assets_type ON assets(asset_type) WHERE deleted_at IS NULL;

-- Índice para búsquedas por uploaded_by
CREATE INDEX idx_assets_uploaded_by ON assets(uploaded_by) WHERE deleted_at IS NULL;

-- Índice para archivos expirados
CREATE INDEX idx_assets_expires_at ON assets(expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL;

-- Índice para búsquedas con tags (GIN index para arrays)
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);

-- Índice para búsquedas en metadata JSONB
CREATE INDEX idx_assets_metadata ON assets USING GIN(metadata);

-- Índice compuesto para paginación
CREATE INDEX idx_assets_created_at ON assets(created_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- Trigger para actualizar updated_at automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comentarios en la tabla y columnas
-- =====================================================

COMMENT ON TABLE assets IS 'Tabla principal para almacenar metadatos de activos digitales (imágenes, documentos, etc.)';
COMMENT ON COLUMN assets.asset_id IS 'UUID único para exposición externa en APIs';
COMMENT ON COLUMN assets.file_hash IS 'Hash SHA256 del archivo para verificación de integridad';
COMMENT ON COLUMN assets.s3_key IS 'Ruta completa del archivo en S3 (key)';
COMMENT ON COLUMN assets.owner_id IS 'ID del propietario del activo (agnóstico al dominio)';
COMMENT ON COLUMN assets.context IS 'Contexto de uso: profile_photo, invoice, product_image, etc.';
COMMENT ON COLUMN assets.metadata IS 'Metadatos adicionales en formato JSON flexible';
COMMENT ON COLUMN assets.expires_at IS 'Fecha de expiración del activo (NULL si no expira)';
COMMENT ON COLUMN assets.deleted_at IS 'Fecha de soft delete (NULL si está activo)';

-- =====================================================
-- Datos de ejemplo (opcional - comentado por defecto)
-- =====================================================

-- INSERT INTO assets (asset_id, file_name, original_name, mime_type, file_size, file_hash, asset_type, s3_bucket, s3_key, owner_id, owner_type, context, uploaded_by)
-- VALUES
-- (gen_random_uuid(), 'profile_123.jpg', 'avatar.jpg', 'image/jpeg', 256000, 'a1b2c3d4e5f6...', 'image', 'my-images-bucket', 'users/123/profile_123.jpg', '123', 'user', 'profile_photo', '123'),
-- (gen_random_uuid(), 'invoice_456.pdf', 'factura_2024.pdf', 'application/pdf', 512000, 'x1y2z3w4v5u6...', 'document', 'my-documents-bucket', 'invoices/456/invoice_456.pdf', '456', 'invoice', 'invoice_document', '789');
