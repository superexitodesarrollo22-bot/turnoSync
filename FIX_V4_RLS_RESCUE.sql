-- ================================================================================
-- SOLUCIÓN GIGA-FIX V4 DEFINITIVA: ELIMINACIÓN DE RECURSIÓN INFINITA EN RLS
-- ================================================================================
-- Este script rompe el círculo vicioso entre users -> business_users -> users
-- utilizando funciones SECURITY DEFINER que no disparan RLS internamente.
-- ================================================================================

-- 1. Limpieza total de funciones conflictivas
DROP FUNCTION IF EXISTS public.get_my_business_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.is_business_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_business_member(uuid) CASCADE;

-- 2. Función ATÓMICA para obtener el ID interno (Bypasea RLS)
CREATE OR REPLACE FUNCTION public.get_identity_id()
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE supabase_auth_uid = auth.uid() LIMIT 1;
$$;

-- 3. Función SEGURA para verificar rol de Admin/Owner (Bypasea RLS)
CREATE OR REPLACE FUNCTION public.is_admin_of(p_business_id uuid)
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_users 
    WHERE business_id = p_business_id 
      AND user_id = public.get_identity_id() 
      AND role IN ('admin', 'owner')
  );
$$;

-- 4. REINICIO DE POLÍTICAS EN TABLAS CRÍTICAS

-- --- Tabla public.users ---
DROP POLICY IF EXISTS "Admin puede leer su perfil" ON public.users;
DROP POLICY IF EXISTS "Admin puede actualizar su perfil" ON public.users;
DROP POLICY IF EXISTS "Admin puede leer clientes de su negocio" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_read_business_clients" ON public.users;

-- Un usuario puede ver su propio perfil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (supabase_auth_uid = auth.uid());

-- Un admin puede ver los perfiles de los clientes que tienen citas en su negocio
CREATE POLICY "users_read_business_clients" ON public.users
  FOR SELECT USING (
    id IN (
      SELECT client_user_id FROM public.appointments 
      WHERE business_id IN (
        SELECT business_id FROM public.business_users 
        WHERE user_id = public.get_identity_id() AND role IN ('admin', 'owner')
      )
    )
  );

-- --- Tabla public.business_users ---
DROP POLICY IF EXISTS "Admin puede ver members de su negocio" ON public.business_users;
DROP POLICY IF EXISTS "business_users_select_own" ON public.business_users;
DROP POLICY IF EXISTS "business_users_select_member" ON public.business_users;

-- Ver mi propia membresía
CREATE POLICY "business_users_select_own" ON public.business_users
  FOR SELECT USING (user_id = public.get_identity_id());

-- Admins ven a todos los miembros de su negocio (sin recursión)
CREATE POLICY "business_users_admin_read_all" ON public.business_users
  FOR SELECT USING (public.is_admin_of(business_id));

-- --- Tabla public.businesses ---
DROP POLICY IF EXISTS "businesses_select_active" ON public.businesses;
DROP POLICY IF EXISTS "Admin puede leer su negocio" ON public.businesses;
DROP POLICY IF EXISTS "businesses_public_read" ON public.businesses;

-- Lectura pública para negocios activos y admins para su propio negocio
CREATE POLICY "businesses_read_access" ON public.businesses
  FOR SELECT USING (active = true OR public.is_admin_of(id));

-- --- Tabla public.appointments ---
DROP POLICY IF EXISTS "appointments_select_client" ON public.appointments;
DROP POLICY IF EXISTS "appointments_select_admin" ON public.appointments;
DROP POLICY IF EXISTS "appointments_read_access" ON public.appointments;

-- El cliente ve sus citas o el admin ve las citas de su negocio
CREATE POLICY "appointments_read_access" ON public.appointments
  FOR SELECT USING (
    client_user_id = public.get_identity_id() 
    OR 
    public.is_admin_of(business_id)
  );

-- Permitir a clientes insertar sus propias citas
DROP POLICY IF EXISTS "appointments_insert_client" ON public.appointments;
CREATE POLICY "appointments_insert_client" ON public.appointments
  FOR INSERT WITH CHECK (client_user_id = public.get_identity_id());

-- ================================================================================
-- FIN DEL SCRIPT: Reinicia tu App y el error debería desaparecer.
-- ================================================================================
