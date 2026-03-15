-- Migration: Roster Expandido
-- Objetivo: Añadir soporte para el Estado/Provincia de nacimiento al Roster B2B para mejorar la precisión de la Malla Elemental.

ALTER TABLE user_roster 
ADD COLUMN birth_state TEXT;
