import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Lista de emails autorizados para acessar a área restrita
const ALLOWED_EMAILS = [
  'info@elpgreen.com',
  'elpenergia@gmail.com',
];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user?.email) {
          const emailLower = session.user.email.toLowerCase();
          const authorized = ALLOWED_EMAILS.some(
            allowed => allowed.toLowerCase() === emailLower
          );
          setIsAuthorized(authorized);
          
          if (!authorized) {
            // Sign out unauthorized users
            setTimeout(() => {
              supabase.auth.signOut();
              toast({
                title: "Acesso negado",
                description: "Seu email não tem permissão para acessar esta área.",
                variant: "destructive",
              });
            }, 0);
          }
        } else {
          setIsAuthorized(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user?.email) {
        const emailLower = session.user.email.toLowerCase();
        const authorized = ALLOWED_EMAILS.some(
          allowed => allowed.toLowerCase() === emailLower
        );
        setIsAuthorized(authorized);
        
        if (!authorized) {
          supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Seu email não tem permissão para acessar esta área.",
            variant: "destructive",
          });
        }
      } else {
        setIsAuthorized(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
