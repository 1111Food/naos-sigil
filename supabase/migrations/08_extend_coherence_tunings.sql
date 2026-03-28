-- Migration: 08_extend_coherence_tunings
-- Description: Add reminder_time and social channel flags for Protocol 21/90 reminders.

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coherence_tunings' AND column_name='reminder_time') THEN
        ALTER TABLE public.coherence_tunings ADD COLUMN reminder_time TIME;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coherence_tunings' AND column_name='telegram_enabled') THEN
        ALTER TABLE public.coherence_tunings ADD COLUMN telegram_enabled BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coherence_tunings' AND column_name='instagram_enabled') THEN
        ALTER TABLE public.coherence_tunings ADD COLUMN instagram_enabled BOOLEAN DEFAULT false;
    END IF;
END $$;
