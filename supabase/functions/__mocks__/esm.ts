// Mock for ESM imports (Supabase JS)
export const createClient = jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
}));
