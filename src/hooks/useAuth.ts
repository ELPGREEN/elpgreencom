import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'editor' | 'viewer';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  granted_by: string | null;
}

interface UseAuthResult {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  role: AppRole | null;
  loading: boolean;
}

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetch
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        // User might not have a role yet
        console.log('No role found for user');
        setRole(null);
      } else {
        setRole(data.role as AppRole);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    isAdmin: role === 'admin',
    role,
    loading,
  };
};
