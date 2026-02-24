-- ============================================================
-- TurnoSync — RLS Test Vectors
-- Run these queries in Supabase SQL Editor to verify RLS.
-- Each block shows the expected result.
-- ============================================================

-- ─── SETUP: Create test sessions ─────────────────────────────
-- These simulate authenticated requests from different users.
-- Replace UUIDs with actual auth UIDs from your seed data.

-- Test User A = admin of business 1 (auth uid: 00000000-0000-0000-0000-000000000001)
-- Test User B = client only         (auth uid: 00000000-0000-0000-0000-000000000002)

-- ─── TEST 1: User can only see their own profile ──────────────
-- Run AS User B (client):
-- SET LOCAL role TO authenticated;
-- SET LOCAL request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000002"}';
-- SELECT * FROM users;
-- EXPECTED: 1 row (only User B's own record)
-- BLOCKED: User A's record should NOT appear

-- ─── TEST 2: Public can read active businesses ────────────────
-- Run AS anonymous:
-- SELECT * FROM businesses WHERE active = true;
-- EXPECTED: Both demo businesses visible

-- ─── TEST 3: Client cannot see other clients' appointments ────
-- Run AS User B:
-- SELECT * FROM appointments;
-- EXPECTED: Only appointments where client_user_id = User B's internal id
-- BLOCKED: Appointments belonging to other clients

-- ─── TEST 4: Client cannot update appointments ────────────────
-- Run AS User B:
-- UPDATE appointments SET status = 'confirmed' WHERE id = '<any_id>';
-- EXPECTED: 0 rows updated (RLS blocks non-admin update)

-- ─── TEST 5: Admin can see all appointments in their business ─
-- Run AS User A (admin of business 1):
-- SELECT * FROM appointments WHERE business_id = 'b0000000-0000-0000-0000-000000000001';
-- EXPECTED: All appointments for business 1

-- ─── TEST 6: Admin cannot see appointments of other business ──
-- Run AS User A:
-- SELECT * FROM appointments WHERE business_id = 'b0000000-0000-0000-0000-000000000002';
-- EXPECTED: 0 rows (RLS blocks cross-business access)

-- ─── TEST 7: Non-owner cannot update business ─────────────────
-- Run AS User B:
-- UPDATE businesses SET name = 'Hacked' WHERE id = 'b0000000-0000-0000-0000-000000000001';
-- EXPECTED: 0 rows updated

-- ─── TEST 8: User can only manage their own devices ───────────
-- Run AS User B:
-- SELECT * FROM user_devices;
-- EXPECTED: Only User B's push tokens

-- ─── AUTOMATED TEST SCRIPT (run with psql or Supabase CLI) ───
-- supabase db test --file supabase/tests/rls_vectors.sql

-- Verify RLS is enabled on all tables:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- EXPECTED: All tables show rowsecurity = true
