-- FASE 1: Actualizar el Tipo ENUM (Ejecutar esto PRIMERO)
-- Nota: PostgreSQL no permite usar un valor nuevo de ENUM en la misma transacción/bloque que se creó.
ALTER TYPE public.protocol_status ADD VALUE IF NOT EXISTS 'awaiting_evolution';

-- -----------------------------------------------------------------------------

-- FASE 2: Modificar Tabla y Datos (Ejecutar esto DESPUÉS de que la Fase 1 termine con éxito)
-- 1. Añadir columnas de control
ALTER TABLE public.user_protocols 
ADD COLUMN IF NOT EXISTS target_days INTEGER DEFAULT 21,
ADD COLUMN IF NOT EXISTS protocol_stage TEXT DEFAULT '21_DAYS';

-- 2. Actualizar la restricción de estados (Fallback por si se usa TEXT en lugar de ENUM)
ALTER TABLE public.user_protocols 
DROP CONSTRAINT IF EXISTS user_protocols_status_check;

ALTER TABLE public.user_protocols 
ADD CONSTRAINT user_protocols_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'awaiting_evolution'));

-- 3. Actualizar registros existentes para coherencia
UPDATE public.user_protocols 
SET target_days = 21, protocol_stage = '21_DAYS' 
WHERE target_days IS NULL;
