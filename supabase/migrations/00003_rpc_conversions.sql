-- ============================================================
-- TurnoSync: RPC Conversion (No-CLI required)
-- Execute this in your Supabase SQL Editor.
-- ============================================================

-- Fix 1: RPC for creating an appointment
CREATE OR REPLACE FUNCTION rpc_create_appointment(
    p_business_id UUID,
    p_service_id UUID,
    p_staff_id UUID,
    p_requested_start_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges, but we filter by auth.uid()
AS $$
DECLARE
    v_user_id UUID;
    v_service_duration INTEGER;
    v_service_price INTEGER;
    v_end_at TIMESTAMPTZ;
    v_blackout_exists BOOLEAN;
    v_schedule_exists BOOLEAN;
    v_overlapping_count INTEGER;
    v_appointment JSONB;
BEGIN
    -- 1. Get internal user ID from auth.uid()
    SELECT id INTO v_user_id FROM public.users WHERE supabase_auth_uid = auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'User not found'));
    END IF;

    -- 2. Fetch service data
    SELECT duration_minutes, price_cents INTO v_service_duration, v_service_price
    FROM public.services
    WHERE id = p_service_id AND business_id = p_business_id AND active = true;

    IF v_service_duration IS NULL THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'INVALID_SERVICE', 'message', 'Service not found or inactive'));
    END IF;

    v_end_at := p_requested_start_at + (v_service_duration || ' minutes')::INTERVAL;

    -- 3. Check blackout dates
    SELECT EXISTS (
        SELECT 1 FROM public.blackout_dates
        WHERE business_id = p_business_id AND date = (p_requested_start_at AT TIME ZONE 'UTC')::DATE
    ) INTO v_blackout_exists;

    IF v_blackout_exists THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'BLACKOUT', 'message', 'This date is blocked'));
    END IF;

    -- 4. Check business schedule
    SELECT EXISTS (
        SELECT 1 FROM public.schedules
        WHERE business_id = p_business_id
          AND weekday = extract(dow from p_requested_start_at AT TIME ZONE 'UTC')
          AND (p_requested_start_at AT TIME ZONE 'UTC')::TIME >= start_time
          AND (v_end_at AT TIME ZONE 'UTC')::TIME <= end_time
    ) INTO v_schedule_exists;

    IF NOT v_schedule_exists THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'OUT_OF_HOURS', 'message', 'Appointment falls outside business hours'));
    END IF;

    -- 5. Check overlapping appointments
    SELECT count(*) INTO v_overlapping_count
    FROM public.appointments
    WHERE business_id = p_business_id
      AND status NOT IN ('cancelled', 'no_show')
      AND start_at < v_end_at
      AND end_at > p_requested_start_at
      AND (p_staff_id IS NULL OR staff_id = p_staff_id);

    IF v_overlapping_count > 0 THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT', 'message', 'Time slot is already booked'));
    END IF;

    -- 6. Insert appointment
    INSERT INTO public.appointments (
        business_id,
        client_user_id,
        service_id,
        staff_id,
        start_at,
        end_at,
        status,
        price_cents
    ) VALUES (
        p_business_id,
        v_user_id,
        p_service_id,
        p_staff_id,
        p_requested_start_at,
        v_end_at,
        'pending',
        v_service_price
    )
    RETURNING row_to_json(appointments)::jsonb INTO v_appointment;

    RETURN jsonb_build_object('data', v_appointment);
END;
$$;

-- Fix 2: RPC for admin analytics
CREATE OR REPLACE FUNCTION rpc_get_admin_analytics(
    p_business_id UUID,
    p_period TEXT DEFAULT 'month'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_is_admin BOOLEAN;
    v_period_start TIMESTAMPTZ;
    v_today_start TIMESTAMPTZ;
    v_today_end TIMESTAMPTZ;
    v_today_count INTEGER;
    v_revenue INTEGER;
    v_no_shows INTEGER;
    v_new_clients INTEGER;
    v_top_services JSONB;
BEGIN
    -- 1. Auth check
    SELECT id INTO v_user_id FROM public.users WHERE supabase_auth_uid = auth.uid();
    SELECT EXISTS (
        SELECT 1 FROM public.business_users
        WHERE business_id = p_business_id AND user_id = v_user_id
    ) INTO v_is_admin;

    IF NOT v_is_admin THEN
        RETURN jsonb_build_object('error', jsonb_build_object('code', 'FORBIDDEN', 'message', 'Access denied'));
    END IF;

    -- 2. Define ranges
    v_today_start := CURRENT_DATE AT TIME ZONE 'UTC';
    v_today_end := v_today_start + INTERVAL '1 day';

    IF p_period = 'today' THEN
        v_period_start := v_today_start;
    ELSIF p_period = 'week' THEN
        v_period_start := NOW() - INTERVAL '7 days';
    ELSE -- month
        v_period_start := date_trunc('month', NOW());
    END IF;

    -- 3. Calculate KPIs
    SELECT count(*) INTO v_today_count FROM public.appointments
    WHERE business_id = p_business_id AND start_at >= v_today_start AND start_at < v_today_end;

    SELECT COALESCE(sum(price_cents), 0) INTO v_revenue FROM public.appointments
    WHERE business_id = p_business_id AND status IN ('confirmed', 'completed') AND start_at >= v_period_start;

    SELECT count(*) INTO v_no_shows FROM public.appointments
    WHERE business_id = p_business_id AND status = 'no_show' AND start_at >= v_period_start;

    SELECT count(DISTINCT client_user_id) INTO v_new_clients FROM public.appointments
    WHERE business_id = p_business_id AND created_at >= v_period_start;

    -- Top services (limit 5)
    SELECT jsonb_agg(t) INTO v_top_services FROM (
        SELECT s.id as service_id, s.name, count(*) as count
        FROM public.appointments a
        JOIN public.services s ON a.service_id = s.id
        WHERE a.business_id = p_business_id
          AND a.start_at >= v_period_start
          AND a.status NOT IN ('cancelled', 'no_show')
        GROUP BY s.id, s.name
        ORDER BY count DESC
        LIMIT 5
    ) t;

    RETURN jsonb_build_object('data', jsonb_build_object(
        'today_appointments', v_today_count,
        'total_revenue_cents', v_revenue,
        'no_shows', v_no_shows,
        'new_clients', v_new_clients,
        'top_services', COALESCE(v_top_services, '[]'::jsonb),
        'period', p_period
    ));
END;
$$;
