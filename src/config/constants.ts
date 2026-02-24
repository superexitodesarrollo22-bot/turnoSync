// ─── App Constants ───────────────────────────────────
export const APP_NAME = 'TurnoSync';
export const DEFAULT_TIMEZONE = 'America/Guayaquil';

// ─── Appointment Statuses ────────────────────────────
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show',
} as const;

export type AppointmentStatus =
    (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

// ─── User Roles ──────────────────────────────────────
export const USER_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    STAFF: 'staff',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Theme Colors ────────────────────────────────────
export const COLORS = {
    // Primary palette
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42DB',

    // Accent
    accent: '#00D9A6',
    accentLight: '#33E3BC',
    accentDark: '#00B88A',

    // Background — dark mode first
    bgDark: '#0F0F1A',
    bgCard: '#1A1A2E',
    bgElevated: '#232340',
    bgSurface: '#2A2A4A',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0C0',
    textMuted: '#6B6B8D',

    // Status
    success: '#00D9A6',
    warning: '#FFB547',
    error: '#FF6B6B',
    info: '#63B3ED',

    // Misc
    border: '#2E2E50',
    overlay: 'rgba(0,0,0,0.6)',
    glass: 'rgba(255,255,255,0.05)',
} as const;

// ─── Typography ──────────────────────────────────────
export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
} as const;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;
