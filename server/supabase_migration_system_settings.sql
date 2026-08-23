CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar el review_mode por defecto a true (o false dependiendo de la intención del user, lo pondré true inicialmente para que pueda correr la prueba ahora)
INSERT INTO system_settings (key, value) VALUES ('review_mode', 'true') ON CONFLICT (key) DO NOTHING;

-- Permitir lectura pblica a system_settings (solo ciertas keys si es necesario, o toda la tabla si no es sensible)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to system_settings"
    ON system_settings
    FOR SELECT
    USING (true);

-- Permitir update solo a admins (Service Role lo har bypass)
CREATE POLICY "Allow update for admin only"
    ON system_settings
    FOR ALL
    USING (auth.jwt() ->> 'email' IN ('luisalfredoherreramendez@gmail.com'));
