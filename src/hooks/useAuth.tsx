import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  userName: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
      if (session?.user) {
        // Fetch role and name from profiles table (security critical)
        setTimeout(async () => {
          const [userRoleData, profileData] = await Promise.all([
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single(),
            supabase
              .from("profiles")
              .select("name, status")
              .eq("id", session.user.id)
              .single()
          ]);
          
          // Check if user is pending approval
          if (profileData.data?.status === "PENDING_APPROVAL") {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setUserRole(null);
            setUserName(null);
            navigate("/auth?pending=true");
            return;
          }
          
          setUserRole(userRoleData.data?.role ?? null);
          setUserName(profileData.data?.name ?? null);
        }, 0);
      } else {
        setUserRole(null);
        setUserName(null);
      }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const [userRoleData, profileData] = await Promise.all([
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single(),
            supabase
              .from("profiles")
              .select("name, status")
              .eq("id", session.user.id)
              .single()
          ]);
          
          // Check if user is pending approval
          if (profileData.data?.status === "PENDING_APPROVAL") {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setUserRole(null);
            setUserName(null);
            setLoading(false);
            navigate("/auth?pending=true");
            return;
          }
          
          setUserRole(userRoleData.data?.role ?? null);
          setUserName(profileData.data?.name ?? null);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setUserName(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, userName, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
