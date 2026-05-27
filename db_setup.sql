-- =====================================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS Y SEGURIDAD PARA CUCUMELL
-- =====================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto de Supabase.
-- Creará las tablas de galletas, configuración de la tienda, la carpeta
-- para fotos y todas las reglas de seguridad necesarias.

-- 1. Tabla de Galletas (cookies)
CREATE TABLE IF NOT EXISTS public.cookies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    image_url TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.cookies ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para cookies
CREATE POLICY "Permitir lectura pública de galletas" ON public.cookies
    FOR SELECT TO public USING (true);

CREATE POLICY "Permitir inserción solo a usuarios autenticados" ON public.cookies
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir actualización solo a usuarios autenticados" ON public.cookies
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Permitir eliminación solo a usuarios autenticados" ON public.cookies
    FOR DELETE TO authenticated USING (true);


-- 2. Tabla de Configuración de la Tienda (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para configuración
CREATE POLICY "Permitir lectura pública de configuraciones" ON public.settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Permitir modificación solo a usuarios autenticados" ON public.settings
    FOR ALL TO authenticated USING (true);


-- 3. Crear el Bucket de Almacenamiento para fotos de galletas (cookie-images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cookie-images', 'cookie-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas de seguridad para el Storage de fotos
CREATE POLICY "Permitir lectura pública de fotos" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'cookie-images');

CREATE POLICY "Permitir subida de fotos a usuarios autenticados" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cookie-images');

CREATE POLICY "Permitir actualización de fotos a usuarios autenticados" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'cookie-images');

CREATE POLICY "Permitir eliminación de fotos a usuarios autenticados" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'cookie-images');


-- 4. Insertar Datos de Respaldo e Iniciales (Seed Data)
-- Esto poblará la base de datos con la información actual de la tienda

-- Datos por defecto para configuración
INSERT INTO public.settings (key, value) VALUES
('whatsapp_phone', '59175585905'),
('instagram_url', 'https://www.instagram.com/cucumell_16/'),
('whatsapp_message', 'Hola Cucumell! Me gustaría pedir la galleta: *{cookie_name}* (Precio: *{cookie_price}*)'),
('about_text', 'Desde el corazón de Santa Cruz de la Sierra, Cucumell trae lo mejor de la repostería artesanal a tu mesa. Usamos ingredientes bolivianos de la más alta calidad para asegurar que cada mordisco te transporte a los mejores momentos en familia.'),
('hero_title', 'Sabor Casero,<br>Desde Santa Cruz.'),
('hero_subtitle', 'Disfruta el auténtico sabor de galletas hechas con amor en Bolivia.'),
('catalog_title', 'Nuestra Selección'),
('catalog_subtitle', 'Horneadas diariamente con ingredientes locales.'),
('about_title', 'Nuestra Historia')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Datos por defecto para galletas
INSERT INTO public.cookies (name, description, price, image_url, order_index) VALUES
('Clásica con Chispas', 'La favorita de todos, crujiente y llena de chocolate.', 'Bs. 5.00 | Bs. 9.00', 'Coockies/coockie1.png', 1),
('Carrot', 'Galleta de zanahoria, nutritiva y con un toque de canela.', 'Bs. 12.00', 'Coockies/coockie2.png', 2),
('Lemon Pie', 'Refrescante toque de limón con un centro suave.', 'Bs. 5.00 | Bs. 10.00', 'Coockies/coockie3.png', 3),
('Especial Cucumell', 'Nuestra receta secreta con trozos de nuez.', 'Bs. 12.00', 'Coockies/coockie4.png', 4)
ON CONFLICT DO NOTHING;
