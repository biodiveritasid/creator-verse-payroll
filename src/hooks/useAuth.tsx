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
  updateUserName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUserStatusAndSetState = async (session: Session | null) => {
    if (!session?.user) {
      setSession(null);
      setUser(null);
      setUserRole(null);
      setUserName(null);
      setLoading(false);
      return;
    }

    setSession(session);
    setUser(session.user);
    setLoading(true);

    try {
      console.log("Fetching profile for user:", session.user.id);
      
      // Fetch profile data with retry logic
      let profileData = null;
      let profileError = null;
      let retries = 3;
      
      while (retries > 0 && !profileData) {
        const result = await supabase
          .from("profiles")
          .select("name, role, status")
          .eq("id", session.user.id)
          .maybeSingle();
        
        profileData = result.data;
        profileError = result.error;
        
        if (profileError || !profileData) {
          console.warn(`Profile fetch attempt ${4 - retries} failed, retrying...`, profileError);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          break;
        }
      }
      
      console.log("Profile fetch result:", { profileData, profileError });
      
      if (profileError) {
        console.error("Error fetching profile after retries:", profileError);
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        return;
      }
      
      if (!profileData) {
        console.error("No profile data found for user after retries");
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        return;
      }
      
      // Check if user is pending approval
      if (profileData?.status === "PENDING_APPROVAL") {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        navigate("/auth?pending=true");
        return;
      }
      
      console.log("Setting user role:", profileData.role, "name:", profileData.name);
      setUserRole(profileData.role);
      setUserName(profileData.name);
      setLoading(false);
      console.log("Auth state updated successfully");
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserRole(null);
      setUserName(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkUserStatusAndSetStateWrapper = async (session: Session | null) => {
      if (mounted) {
        await checkUserStatusAndSetState(session);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await checkUserStatusAndSetStateWrapper(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUserStatusAndSetStateWrapper(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  const updateUserName = (name: string) => {
    setUserName(name);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, userName, loading, signIn, signUp, signOut, updateUserName }}>
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
