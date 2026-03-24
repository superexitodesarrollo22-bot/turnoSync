-- ============================================================
-- FIX: RECURSIÓN INFINITA EN POLÍTICAS RLS (users / business_users)
-- ============================================================
-- Este script resuelve el error "infinite recursion detected in policy for relation users"
-- El problema ocurre cuando la política de 'users' consulta 'business_users' 
-- y viceversa, creando un bucle infinito en la evaluación de seguridad.
-- ============================================================

-- PASO 1: Crear una función auxiliar SECURITY DEFINER.
-- Esto permite obtener el ID interno del usuario sin disparar RLS recursivamente.
CREATE OR REPLACE FUNCTION get_my_internal_id() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
AS $$
  -- Retorna el ID de la tabla publica 'users' mapeado al UID de auth
  SELECT id FROM public.users WHERE supabase_auth_uid = auth.uid();
$$;

-- PASO 2: Eliminar las políticas con potencial de recursión
DROP POLICY IF EXISTS "business_users_select_own" ON business_users;
DROP POLICY IF EXISTS "business_users_manage_owner" ON business_users;
DROP POLICY IF EXISTS "appointments_select_client" ON appointments;
DROP POLICY IF EXISTS "appointments_select_admin" ON appointments;
DROP POLICY IF EXISTS "appointments_update_admin" ON appointments;
DROP POLICY IF EXISTS "users_select_own" ON users;

-- PASO 3: Re-crear las políticas usando la función helper (SIN RECURSIÓN)

-- Poliza simple para la tabla users (solo comparación directa)
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (supabase_auth_uid = auth.uid());

-- Poliza para business_users usando el helper
CREATE POLICY "business_users_select_own" ON business_users
  FOR SELECT USING (user_id = get_my_internal_id());

CREATE POLICY "business_users_manage_owner" ON business_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      WHERE bu.business_id = business_users.business_id
        AND bu.role = 'owner'
        AND bu.user_id = get_my_internal_id()
    )
  );

-- Polizas para appointments usando el helper
CREATE POLICY "appointments_select_client" ON appointments
  FOR SELECT USING (client_user_id = get_my_internal_id());

CREATE POLICY "appointments_select_admin" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      WHERE bu.business_id = appointments.business_id
        AND bu.user_id = get_my_internal_id()
    )
  );

CREATE POLICY "appointments_update_admin" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_users bu
      WHERE bu.business_id = appointments.business_id
        AND bu.role IN ('owner', 'admin')
        AND bu.user_id = get_my_internal_id()
    )
  );

-- PASO 4: Test de verificación (Opcional)
-- SELECT get_my_internal_id(); -- Debería retornar el UUID de tu usuario en la tabla users
