-- Tabla para el Roster Maestro del Usuario (Dinámicas de Grupo y Sinastría)
-- Almacena perfiles (Nodos) bajo el paraguas del Arquitecto (user_id)

CREATE TABLE IF NOT EXISTS user_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    birth_time TIME,
    birth_city TEXT,
    birth_country TEXT,
    role_label TEXT, -- Ej: "Socio", "Dev", "Directora", "Vínculo"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas al cargar el roster del usuario
CREATE INDEX IF NOT EXISTS idx_user_roster_userid ON user_roster(user_id);

-- Políticas RLS (Row Level Security) (Ejemplo si tienes RLS activo)
-- ALTER TABLE user_roster ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their own roster" ON user_roster FOR ALL USING (auth.uid() = user_id);
