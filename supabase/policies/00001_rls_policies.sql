-- ============================================================
-- TurnoSync — Row Level Security Policies
-- Applied in Phase 1 after schema migration.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- ─── users ────────────────────────────────────────────
-- Users can only read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (supabase_auth_uid = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (supabase_auth_uid = auth.uid());

-- Users can insert their own profile (upsert on login)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (supabase_auth_uid = auth.uid());

-- ─── businesses ───────────────────────────────────────
-- Public read for active businesses
CREATE POLICY "businesses_select_active" ON businesses
  FOR SELECT USING (active = true);

-- Only owners can update their business
CREATE POLICY "businesses_update_owner" ON businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = businesses.id
        AND bu.role = 'owner'
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── business_users ──────────────────────────────────
-- Users can see their own business memberships
CREATE POLICY "business_users_select_own" ON business_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = business_users.user_id
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- Owners can manage business users in their business
CREATE POLICY "business_users_manage_owner" ON business_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = business_users.business_id
        AND bu.role = 'owner'
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── services ─────────────────────────────────────────
-- Public read for active services
CREATE POLICY "services_select_active" ON services
  FOR SELECT USING (active = true);

-- Owners/admins can manage services
CREATE POLICY "services_manage_admin" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = services.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── staff ────────────────────────────────────────────
-- Public read for active staff
CREATE POLICY "staff_select_active" ON staff
  FOR SELECT USING (active = true);

-- Owners/admins can manage staff
CREATE POLICY "staff_manage_admin" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = staff.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── schedules ────────────────────────────────────────
-- Public read
CREATE POLICY "schedules_select_public" ON schedules
  FOR SELECT USING (true);

-- Owners/admins can manage
CREATE POLICY "schedules_manage_admin" ON schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = schedules.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── blackout_dates ──────────────────────────────────
-- Public read
CREATE POLICY "blackout_dates_select_public" ON blackout_dates
  FOR SELECT USING (true);

-- Owners/admins can manage
CREATE POLICY "blackout_dates_manage_admin" ON blackout_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = blackout_dates.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── appointments ─────────────────────────────────────
-- Clients can see their own appointments
CREATE POLICY "appointments_select_client" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = appointments.client_user_id
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- Admins can see appointments in their business
CREATE POLICY "appointments_select_admin" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = appointments.business_id
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- Admins can update appointments in their business
CREATE POLICY "appointments_update_admin" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = appointments.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── audit_logs ──────────────────────────────────────
-- Admins can read audit logs for their business
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      JOIN users u ON bu.user_id = u.id
      WHERE bu.business_id = audit_logs.business_id
        AND bu.role IN ('owner', 'admin')
        AND u.supabase_auth_uid = auth.uid()
    )
  );

-- ─── user_devices ─────────────────────────────────────
-- Users can manage their own devices
CREATE POLICY "user_devices_own" ON user_devices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_devices.user_id
        AND u.supabase_auth_uid = auth.uid()
    )
  );
