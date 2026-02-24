-- ============================================================
-- TurnoSync — Migration 00002: Additional Indexes & Helpers
-- Phase 1: Performance + helper functions
-- ============================================================

-- ─── Helper function: get internal user id from auth.uid() ───
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM users WHERE supabase_auth_uid = auth.uid() LIMIT 1;
$$;

-- ─── Helper function: check if user is admin of a business ───
CREATE OR REPLACE FUNCTION is_business_admin(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM business_users bu
    JOIN users u ON bu.user_id = u.id
    WHERE bu.business_id = p_business_id
      AND bu.role IN ('owner', 'admin')
      AND u.supabase_auth_uid = auth.uid()
  );
$$;

-- ─── Helper function: check if user is member of a business ──
CREATE OR REPLACE FUNCTION is_business_member(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM business_users bu
    JOIN users u ON bu.user_id = u.id
    WHERE bu.business_id = p_business_id
      AND u.supabase_auth_uid = auth.uid()
  );
$$;

-- ─── Composite index for appointment slot lookup ─────────────
-- Used by create_appointment to check overlaps
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup
  ON appointments (business_id, staff_id, start_at, end_at)
  WHERE status NOT IN ('cancelled', 'no_show');

-- ─── Index for blackout date lookup ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_blackout_date_lookup
  ON blackout_dates (business_id, date);

-- ─── Index for schedule lookup ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schedules_weekday
  ON schedules (business_id, weekday);
