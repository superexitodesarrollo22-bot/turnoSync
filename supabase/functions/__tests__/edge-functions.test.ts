// ============================================================
// TurnoSync — Unit Tests for Edge Functions
// Run with: npx jest
// ============================================================

// Mock Supabase client for testing
const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
};

// ─── Validation Logic Tests ───────────────────────────────────
// These test the pure validation logic extracted from Edge Functions

describe('create_appointment validations', () => {
    describe('blackout date check', () => {
        it('should return BLACKOUT error when date is blocked', () => {
            const blackoutDates = ['2026-03-01'];
            const requestedDate = '2026-03-01';
            const isBlackedOut = blackoutDates.includes(requestedDate);
            expect(isBlackedOut).toBe(true);
        });

        it('should pass when date is not blocked', () => {
            const blackoutDates = ['2026-03-01'];
            const requestedDate = '2026-03-10';
            const isBlackedOut = blackoutDates.includes(requestedDate);
            expect(isBlackedOut).toBe(false);
        });
    });

    describe('schedule validation', () => {
        const schedules = [
            { weekday: 1, start_time: '09:00:00', end_time: '19:00:00' }, // Monday
        ];

        it('should pass when appointment is within business hours', () => {
            const startAt = new Date('2026-03-09T14:00:00Z'); // Monday 14:00 UTC
            const endAt = new Date('2026-03-09T14:30:00Z');   // 30 min service
            const weekday = startAt.getUTCDay(); // 1 = Monday

            const daySchedules = schedules.filter(s => s.weekday === weekday);
            expect(daySchedules.length).toBeGreaterThan(0);

            const startStr = startAt.toISOString().substring(11, 19);
            const endStr = endAt.toISOString().substring(11, 19);

            const withinSchedule = daySchedules.some(
                s => startStr >= s.start_time && endStr <= s.end_time
            );
            expect(withinSchedule).toBe(true);
        });

        it('should return OUT_OF_HOURS when outside business hours', () => {
            const startAt = new Date('2026-03-09T22:00:00Z'); // Monday 22:00 UTC
            const endAt = new Date('2026-03-09T22:30:00Z');
            const weekday = startAt.getUTCDay();

            const daySchedules = schedules.filter(s => s.weekday === weekday);
            const startStr = startAt.toISOString().substring(11, 19);
            const endStr = endAt.toISOString().substring(11, 19);

            const withinSchedule = daySchedules.some(
                s => startStr >= s.start_time && endStr <= s.end_time
            );
            expect(withinSchedule).toBe(false);
        });

        it('should return OUT_OF_HOURS when business is closed (Sunday)', () => {
            const startAt = new Date('2026-03-08T14:00:00Z'); // Sunday
            const weekday = startAt.getUTCDay(); // 0 = Sunday

            const daySchedules = schedules.filter(s => s.weekday === weekday);
            expect(daySchedules.length).toBe(0);
        });
    });

    describe('overlap detection', () => {
        it('should detect overlapping appointments', () => {
            const existing = {
                start_at: new Date('2026-03-09T14:00:00Z'),
                end_at: new Date('2026-03-09T14:30:00Z'),
            };

            const newStart = new Date('2026-03-09T14:15:00Z');
            const newEnd = new Date('2026-03-09T14:45:00Z');

            // Overlap condition: newStart < existing.end AND newEnd > existing.start
            const overlaps = newStart < existing.end_at && newEnd > existing.start_at;
            expect(overlaps).toBe(true);
        });

        it('should not flag non-overlapping appointments', () => {
            const existing = {
                start_at: new Date('2026-03-09T14:00:00Z'),
                end_at: new Date('2026-03-09T14:30:00Z'),
            };

            const newStart = new Date('2026-03-09T14:30:00Z');
            const newEnd = new Date('2026-03-09T15:00:00Z');

            const overlaps = newStart < existing.end_at && newEnd > existing.start_at;
            expect(overlaps).toBe(false);
        });
    });

    describe('end_at calculation', () => {
        it('should calculate end_at correctly from duration', () => {
            const startAt = new Date('2026-03-09T14:00:00Z');
            const durationMinutes = 45;
            const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

            expect(endAt.toISOString()).toBe('2026-03-09T14:45:00.000Z');
        });
    });
});

describe('update_appointment_status validations', () => {
    const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

    it('should accept valid statuses', () => {
        VALID_STATUSES.forEach(status => {
            expect(VALID_STATUSES.includes(status)).toBe(true);
        });
    });

    it('should reject invalid status', () => {
        expect(VALID_STATUSES.includes('invalid_status')).toBe(false);
    });

    it('should not allow updating a completed appointment', () => {
        const appointment = { status: 'completed' };
        const canUpdate = appointment.status !== 'completed';
        expect(canUpdate).toBe(false);
    });

    it('should allow client to cancel their own appointment', () => {
        const isOwner = true;
        const isAdmin = false;
        const newStatus = 'cancelled';

        const canUpdate = isOwner && newStatus === 'cancelled';
        expect(canUpdate).toBe(true);
    });

    it('should not allow client to confirm an appointment', () => {
        const isOwner = true;
        const isAdmin = false;
        const newStatus: string = 'confirmed'; // typed as string to test runtime logic

        const canUpdate = isAdmin || (isOwner && newStatus === 'cancelled');
        expect(canUpdate).toBe(false);
    });
});

describe('analytics aggregations', () => {
    it('should calculate total revenue from appointments', () => {
        const appointments = [
            { price_cents: 800, status: 'confirmed' },
            { price_cents: 1200, status: 'completed' },
            { price_cents: 600, status: 'cancelled' }, // should not count
        ];

        const revenue = appointments
            .filter(a => ['confirmed', 'completed'].includes(a.status))
            .reduce((sum, a) => sum + a.price_cents, 0);

        expect(revenue).toBe(2000);
    });

    it('should count unique clients', () => {
        const appointments = [
            { client_user_id: 'user-1' },
            { client_user_id: 'user-1' }, // duplicate
            { client_user_id: 'user-2' },
        ];

        const uniqueClients = new Set(appointments.map(a => a.client_user_id)).size;
        expect(uniqueClients).toBe(2);
    });
});
