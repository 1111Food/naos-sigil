-- Migration: 06_add_module_type_to_tunings
-- Description: Add module_type to distinguish between protocol and elemental lab tunings.

-- Add module_type column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coherence_tunings' AND column_name='module_type') THEN
        ALTER TABLE public.coherence_tunings ADD COLUMN module_type VARCHAR(50) DEFAULT 'protocol21';
    END IF;
END $$;

-- Update existing records to 'protocol21'
UPDATE public.coherence_tunings SET module_type = 'protocol21' WHERE module_type IS NULL;

-- Drop existing unique constraint if it exists (assuming it was on user_id, aspect)
-- We need to find the constraint name first. Usually it's something like coherence_tunings_user_id_aspect_key
DO $$
DECLARE
    const_name TEXT;
BEGIN
    SELECT conname INTO const_name
    FROM pg_constraint
    WHERE conrelid = 'public.coherence_tunings'::regclass AND contype = 'u';
    
    IF const_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.coherence_tunings DROP CONSTRAINT ' || const_name;
    END IF;
END $$;

-- Add new unique constraint including module_type
ALTER TABLE public.coherence_tunings ADD CONSTRAINT coherence_tunings_user_module_aspect_key UNIQUE (user_id, module_type, aspect);

-- Update index for performance
CREATE INDEX IF NOT EXISTS idx_coherence_tunings_module_type ON public.coherence_tunings(module_type);
