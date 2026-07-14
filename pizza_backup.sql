-- ====================================================================
-- SCRIPT DE RESPALDO COMPLETO - BASE DE DATOS PLANET PIZZA
-- ====================================================================

-- 1. CREACIÓN DE TIPOS ENUM (Con los nombres que Sequelize espera)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Ingredients_categoria') THEN
        CREATE TYPE "enum_Ingredients_categoria" AS ENUM ('masa', 'salsa', 'queso', 'extra');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Orders_status') THEN
        CREATE TYPE "enum_Orders_status" AS ENUM ('Pendiente', 'Preparando', 'Listo', 'Entregado');
    END IF;
END$$;

-- 2. TABLA: Sizes
CREATE TABLE IF NOT EXISTS "Sizes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "medida" VARCHAR(100) NOT NULL,
  "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: Ingredients
CREATE TABLE IF NOT EXISTS "Ingredients" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
  "categoria" "enum_Ingredients_categoria" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: Pizzas
CREATE TABLE IF NOT EXISTS "Pizzas" (
  "id" VARCHAR(100) PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "descripcion" TEXT,
  "imagen" VARCHAR(255) DEFAULT '',
  "precioBase" DOUBLE PRECISION NOT NULL CHECK ("precioBase" >= 0),
  "defaultMasa" VARCHAR(100) DEFAULT 'Tradicional',
  "defaultSalsa" VARCHAR(100) DEFAULT 'Salsa de Tomate',
  "defaultQueso" VARCHAR(100) DEFAULT 'Mozzarella',
  "defaultExtras" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA: Promos
CREATE TABLE IF NOT EXISTS "Promos" (
  "id" VARCHAR(100) PRIMARY KEY,
  "nombre" VARCHAR(100) NOT NULL UNIQUE,
  "descripcion" TEXT,
  "precio" DOUBLE PRECISION NOT NULL CHECK ("precio" >= 0),
  "imagen" VARCHAR(255) DEFAULT '',
  "badge" VARCHAR(100) DEFAULT '',
  "pizzaBaseId" VARCHAR(100) NOT NULL REFERENCES "Pizzas"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: Orders
CREATE TABLE IF NOT EXISTS "Orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderNumber" VARCHAR(20) NOT NULL UNIQUE,
  "items" JSONB NOT NULL,
  "total" DOUBLE PRECISION NOT NULL CHECK ("total" >= 0),
  "status" "enum_Orders_status" NOT NULL DEFAULT 'Pendiente',
  "paymentStatus" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "metodoPago" VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
  "nombreCliente" VARCHAR(100),
  "emailCliente" VARCHAR(150),
  "paymentId" VARCHAR(100),
  "preferenceId" VARCHAR(100),
  "time" VARCHAR(50),
  "timestamp" BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: Users
CREATE TABLE IF NOT EXISTS "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "correo" VARCHAR(150) NOT NULL UNIQUE,
  "contrasena" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- DATOS DE CARGA INICIAL (SEEDS)
-- ====================================================================

-- Carga: Sizes
INSERT INTO "Sizes" (nombre, medida, precio) VALUES 
('Personal', '25 cm', 90.00),
('Mediana', '30 cm', 150.00),
('Familiar', '35 cm', 200.00)
ON CONFLICT (nombre) DO NOTHING;

-- Carga: Ingredients
INSERT INTO "Ingredients" (nombre, precio, categoria) VALUES 
('Masa Tradicional', 0.00, 'masa'),
('Masa Delgada', 10.00, 'masa'),
('Masa Orilla de Queso', 35.00, 'masa'),
('Salsa de Tomate', 0.00, 'salsa'),
('Salsa BBQ', 10.00, 'salsa'),
('Mozzarella', 15.00, 'queso'),
('Doble Queso', 25.00, 'queso'),
('Pepperoni', 20.00, 'extra'),
('Piña', 15.00, 'extra'),
('Jamón', 20.00, 'extra'),
('Champiñones', 18.00, 'extra'),
('Cebolla', 10.00, 'extra')
ON CONFLICT (nombre) DO NOTHING;

-- Carga: Pizzas
INSERT INTO "Pizzas" (id, nombre, descripcion, imagen, "precioBase", "defaultMasa", "defaultSalsa", "defaultQueso", "defaultExtras") VALUES 
('pizza-pepperoni', 'Pizza de Pepperoni', 'La clásica e infalible, repleta de pepperoni crujiente y queso fundido.', '/images/pepperoni.jpg', 120.00, 'Masa Tradicional', 'Salsa de Tomate', 'Mozzarella', '["Pepperoni"]'::jsonb),
('pizza-hawaiana', 'Pizza Hawaiana', 'Para los amantes del contraste: jamón jugoso y piña dulce.', '/images/hawaiana.jpg', 130.00, 'Masa Tradicional', 'Salsa de Tomate', 'Mozzarella', '["Piña", "Jamón"]'::jsonb),
('pizza-vegetariana', 'Pizza Vegetariana', 'Fresca y ligera, cargada de champiñones frescos y cebolla.', '/images/vegetariana.jpg', 110.00, 'Masa Delgada', 'Salsa de Tomate', 'Mozzarella', '["Champiñones", "Cebolla"]'::jsonb),
('pizza-bbq', 'Pizza BBQ', 'Todo el sabor del BBQ con una base ahumada y doble queso.', '/images/bbq.jpg', 140.00, 'Masa Tradicional', 'Salsa BBQ', 'Doble Queso', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Carga: Promos
INSERT INTO "Promos" ("id", "nombre", "descripcion", "precio", "imagen", "badge", "pizzaBaseId") VALUES
('combo-pareja', 'Combo Pareja', '1 Pizza Mediana de Pepperoni + 2 Refrescos. ¡Ideal para compartir!', 199.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80', 'Popular', 'pizza-pepperoni'),
('mega-familiar', 'Mega Familiar', '1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento. ¡Gran sabor familiar!', 329.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80', 'Más Vendido', 'pizza-hawaiana')
ON CONFLICT (id) DO NOTHING;

-- Carga: Users (Usuario Administrador por defecto: admin@planetpizza.com / pizzaplaneta123921_xdd)
INSERT INTO "Users" (correo, contrasena) VALUES 
('admin@planetpizza.com', '$2a$10$tM95V7vJ0tI7k00pQ74yQOrZp9c2V3Sj4fR.K7V1S68z6wH9mIeq.')
ON CONFLICT (correo) DO NOTHING;
