// ─── Database Types ──────────────────────────────────

export interface Business {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    logo_url: string | null;
    timezone: string;
    active: boolean;
    created_at: string;
}

export interface User {
    id: string;
    supabase_auth_uid: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
}


export interface Service {
    id: string;
    business_id: string;
    name: string;
    duration_minutes: number;
    price_cents: number;
    active: boolean;
}

export interface Staff {
    id: string;
    business_id: string;
    name: string;
    photo_url: string | null;
    active: boolean;
}

export interface Schedule {
    id: string;
    business_id: string;
    weekday: number; // 0-6 (Sun-Sat)
    start_time: string; // HH:MM:SS
    end_time: string;
}

export interface BlackoutDate {
    id: string;
    business_id: string;
    date: string; // YYYY-MM-DD
    reason: string | null;
}

export interface Appointment {
    id: string;
    business_id: string;
    client_user_id: string;
    service_id: string;
    staff_id: string | null;
    start_at: string;
    end_at: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    price_cents: number;
    notes: string | null;
    created_at: string;
}

export interface AuditLog {
    id: string;
    business_id: string | null;
    user_id: string | null;
    action: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface UserDevice {
    id: string;
    user_id: string;
    expo_push_token: string;
    created_at: string;
}

// ─── RPC Types ───────────────────────────────────────

export interface CreateAppointmentPayload {
    business_id: string;
    service_id: string;
    staff_id?: string;
    requested_start_at: string;
}

export interface UpdateAppointmentStatusPayload {
    appointment_id: string;
    status: Appointment['status'];
}

export interface SearchBusinessesPayload {
    q: string;
    lat?: number;
    lng?: number;
    radius?: number;
}

// ─── Navigation Types ────────────────────────────────

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    BusinessProfile: { businessId: string };
    BookingFlow: { businessId: string };
};

export type MainTabParamList = {
    Home: undefined;
    MyBookings: undefined;
    Profile: undefined;
};


export type BookingFlowParamList = {
    SelectService: { businessId: string };
    SelectStaff: { businessId: string; serviceId: string };
    SelectDateTime: {
        businessId: string;
        serviceId: string;
        staffId?: string;
    };
    Confirm: {
        businessId: string;
        serviceId: string;
        staffId?: string;
        startAt: string;
    };
    BookingSuccess: {
        businessName: string;
        serviceName: string;
        date: string;
        time: string;
    };
};

