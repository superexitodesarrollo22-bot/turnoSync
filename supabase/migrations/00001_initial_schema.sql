-- ============================================================
-- TurnoSync — Initial Schema Migration
-- Phase 1 will apply these migrations to Supabase.
-- This file serves as the schema reference for Phase 0.
-- ============================================================

-- 1. Custom ENUM types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- 2. businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Guayaquil',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_auth_uid UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. business_users (multi-tenant role assignments)
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, user_id)
);

-- 5. services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  price_cents INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 6. staff
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 7. schedules (weekly recurring hours)
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  weekday INT NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time)
);

-- 8. blackout_dates
CREATE TABLE blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT
);

-- 9. appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  price_cents INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);

-- 10. audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. user_devices (push tokens)
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, expo_push_token)
);

-- ─── Performance Indexes ──────────────────────────────
CREATE INDEX idx_appointments_business_start ON appointments (business_id, start_at);
CREATE INDEX idx_appointments_client ON appointments (client_user_id);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_business_users_user ON business_users (user_id);
CREATE INDEX idx_services_business ON services (business_id);
CREATE INDEX idx_staff_business ON staff (business_id);
CREATE INDEX idx_schedules_business ON schedules (business_id);
CREATE INDEX idx_blackout_business ON blackout_dates (business_id, date);
CREATE INDEX idx_audit_logs_business ON audit_logs (business_id, created_at);
