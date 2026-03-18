-- 🛸 NAOS DATABASE PATCH: CREATE MISSING HISTORY TABLES
-- Copia y pega este script en el editor SQL de tu panel de Supabase

--------------------------------------------------
-- 1. TABLA: synastry_history (PARA SINASTRIAS)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.synastry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_name TEXT NOT NULL,
    partner_birth_date TEXT,
    relationship_type TEXT,
    combination_hash TEXT,
    calculated_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.synastry_history ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
DROP POLICY IF EXISTS "Usuarios pueden ver su propio historial de sinastria" ON public.synastry_history;
CREATE POLICY "Usuarios pueden ver su propio historial de sinastria" 
ON public.synastry_history FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propia sinastria" ON public.synastry_history;
CREATE POLICY "Usuarios pueden insertar su propia sinastria" 
ON public.synastry_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar su propia sinastria" ON public.synastry_history;
CREATE POLICY "Usuarios pueden borrar su propia sinastria" 
ON public.synastry_history FOR DELETE 
USING (auth.uid() = user_id);


--------------------------------------------------
-- 2. TABLA: rituals_history (PARA TAROT)
-- (Por si acaso faltan políticas RLS o columnas)
--------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rituals_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intention TEXT,
    cards JSONB NOT NULL,
    engine TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.rituals_history ENABLE ROW LEVEL SECURITY;

-- Crear o actualizar políticas de acceso
DROP POLICY IF EXISTS "Usuarios pueden ver su propio historial de tarot" ON public.rituals_history;
CREATE POLICY "Usuarios pueden ver su propio historial de tarot" 
ON public.rituals_history FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio tarot" ON public.rituals_history;
CREATE POLICY "Usuarios pueden insertar su propio tarot" 
ON public.rituals_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar su propio tarot" ON public.rituals_history;
CREATE POLICY "Usuarios pueden borrar su propio tarot" 
ON public.rituals_history FOR DELETE 
USING (auth.uid() = user_id);
