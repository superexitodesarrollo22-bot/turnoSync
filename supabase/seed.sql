-- ============================================================
-- TurnoSync — Seed Data (Demo)
-- 2 barberías, demo users, services, staff, schedules
-- ============================================================

-- Demo Users (supabase_auth_uid will be updated after real auth setup)
INSERT INTO users (id, supabase_auth_uid, email, full_name, avatar_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@turnosync.dev', 'Carlos Admin', NULL),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'cliente@turnosync.dev', 'María Cliente', NULL);

-- Demo Businesses
INSERT INTO businesses (id, name, slug, description, address, phone, whatsapp, timezone) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Barbería El Clásico', 'barberia-el-clasico', 'La mejor barbería de Guayaquil. Cortes clásicos y modernos.', 'Av. 9 de Octubre 123, Guayaquil', '+593991234567', '+593991234567', 'America/Guayaquil'),
  ('b0000000-0000-0000-0000-000000000002', 'Cortes Premium GYE', 'cortes-premium-gye', 'Estilo y precisión en cada corte.', 'Mall del Sol, Local 45', '+593997654321', '+593997654321', 'America/Guayaquil');

-- Assign admin to first business
INSERT INTO business_users (business_id, user_id, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'owner');

-- Services for Business 1
INSERT INTO services (business_id, name, duration_minutes, price_cents) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Corte Clásico', 30, 800),
  ('b0000000-0000-0000-0000-000000000001', 'Corte + Barba', 45, 1200),
  ('b0000000-0000-0000-0000-000000000001', 'Afeitado Premium', 20, 600),
  ('b0000000-0000-0000-0000-000000000001', 'Corte Infantil', 25, 500);

-- Services for Business 2
INSERT INTO services (business_id, name, duration_minutes, price_cents) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Corte Ejecutivo', 30, 1000),
  ('b0000000-0000-0000-0000-000000000002', 'Corte + Diseño', 50, 1500),
  ('b0000000-0000-0000-0000-000000000002', 'Tratamiento Capilar', 40, 2000);

-- Staff for Business 1
INSERT INTO staff (business_id, name) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Pedro Barbero'),
  ('b0000000-0000-0000-0000-000000000001', 'Luis Estilista');

-- Staff for Business 2
INSERT INTO staff (business_id, name) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Roberto Pro'),
  ('b0000000-0000-0000-0000-000000000002', 'Ana Stylist');

-- Schedules for Business 1 (Mon-Sat 9am-7pm)
INSERT INTO schedules (business_id, weekday, start_time, end_time) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, '09:00', '19:00'),
  ('b0000000-0000-0000-0000-000000000001', 2, '09:00', '19:00'),
  ('b0000000-0000-0000-0000-000000000001', 3, '09:00', '19:00'),
  ('b0000000-0000-0000-0000-000000000001', 4, '09:00', '19:00'),
  ('b0000000-0000-0000-0000-000000000001', 5, '09:00', '19:00'),
  ('b0000000-0000-0000-0000-000000000001', 6, '09:00', '14:00');

-- Schedules for Business 2 (Mon-Fri 10am-8pm)
INSERT INTO schedules (business_id, weekday, start_time, end_time) VALUES
  ('b0000000-0000-0000-0000-000000000002', 1, '10:00', '20:00'),
  ('b0000000-0000-0000-0000-000000000002', 2, '10:00', '20:00'),
  ('b0000000-0000-0000-0000-000000000002', 3, '10:00', '20:00'),
  ('b0000000-0000-0000-0000-000000000002', 4, '10:00', '20:00'),
  ('b0000000-0000-0000-0000-000000000002', 5, '10:00', '20:00');

-- Blackout date example
INSERT INTO blackout_dates (business_id, date, reason) VALUES
  ('b0000000-0000-0000-0000-000000000001', '2026-03-01', 'Día del Barbero');
