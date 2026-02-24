import { useAuth } from '../contexts/AuthContext';

export const useCurrentUser = () => {
    const { profile, loading } = useAuth();
    return { user: profile, loading };
};
