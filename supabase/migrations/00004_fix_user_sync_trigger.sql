-- ============================================================
-- TurnoSync — Migration 00004: Fix User Sync Trigger
-- Ensures that when a user signs up with Google (OAuth),
-- if their email already exists in public.users, we update
-- their supabase_auth_uid instead of failing.
-- ============================================================

-- 1. Create (or Replace) the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert or Update based on email conflict
  INSERT INTO public.users (supabase_auth_uid, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (email) DO UPDATE SET
    supabase_auth_uid = excluded.supabase_auth_uid,
    full_name = COALESCE(excluded.full_name, public.users.full_name),
    avatar_url = COALESCE(excluded.avatar_url, public.users.avatar_url);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the Trigger to auth.users (runs ONLY on INSERT)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Bind the Trigger to auth.users (handles UPDATES if linking occurs)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Manual sync for existing users in auth.users that might be missing in public.users
-- This is optional but good for consistency
INSERT INTO public.users (supabase_auth_uid, email, full_name, avatar_url)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', ''), 
    COALESCE(raw_user_meta_data->>'avatar_url', '')
FROM auth.users
ON CONFLICT (email) DO UPDATE SET
    supabase_auth_uid = excluded.supabase_auth_uid;
