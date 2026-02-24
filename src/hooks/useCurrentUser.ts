import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const useCurrentUser = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) { setLoading(false); return; }
            const { data } = await supabase.from('users').select('*').eq('supabase_auth_uid', authUser.id).single();
            setUser(data);
            setLoading(false);
        };
        fetch();
    }, []);

    return { user, loading };
};
