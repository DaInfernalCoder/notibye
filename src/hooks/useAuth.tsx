import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEV MODE: Skip real auth for development
    const DEV_MODE = true;
    
    if (DEV_MODE) {
      // Create a mock user for development and establish a real Supabase session
      const initDevAuth = async () => {
        try {
          // Check if we already have a session
          const { data: { session: existingSession } } = await supabase.auth.getSession();
          
          if (!existingSession) {
            // Sign in anonymously to create a real Supabase session
            const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
            
            if (authError) {
              console.error('❌ Failed to create anonymous session:', authError);
              // Fallback to mock user without session
              const mockUser = {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'dev@churnflow.com', 
                created_at: new Date().toISOString(),
                app_metadata: {},
                user_metadata: {},
                aud: 'authenticated',
                role: 'authenticated'
              } as User;
              
              setUser(mockUser);
              setSession({ 
                access_token: 'dev-token',
                refresh_token: 'dev-refresh',
                expires_in: 3600,
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                token_type: 'bearer',
                user: mockUser
              } as Session);
            } else {
              console.log('✅ Created anonymous Supabase session');
              setUser(authData.user);
              setSession(authData.session);
            }
          } else {
            console.log('✅ Using existing Supabase session');
            setUser(existingSession.user);
            setSession(existingSession);
          }
        } catch (error) {
          console.error('❌ Dev auth initialization failed:', error);
        } finally {
          setLoading(false);
        }
      };

      initDevAuth();
    } else {
      // Original Supabase auth setup
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};