-- NAOS Protocol Evolution Status Patch
-- Permite el estado 'evolved' en la tabla de intenciones (protocols)

ALTER TABLE protocols DROP CONSTRAINT IF EXISTS protocols_status_check;

ALTER TABLE protocols ADD CONSTRAINT protocols_status_check 
CHECK (status IN ('active', 'completed', 'archived', 'abandoned', 'evolved'));
