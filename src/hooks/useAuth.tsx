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
    console.log("checkUserStatusAndSetState called with:", session?.user?.email);
    
    if (!session?.user) {
      console.log("No session, clearing state");
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

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn("Auth check timeout - setting loading to false");
      setLoading(false);
    }, 5000);

    try {
      console.log("Fetching profile for user:", session.user.id);
      
      // Fetch profile data which contains role and status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, role, status")
        .eq("id", session.user.id)
        .single();
      
      clearTimeout(timeoutId);
      console.log("Profile data:", profileData, "Error:", profileError);
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        return;
      }
      
      // Check if user is pending approval
      if (profileData?.status === "PENDING_APPROVAL") {
        console.log("User is pending approval, signing out");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setUserRole(null);
        setUserName(null);
        setLoading(false);
        navigate("/auth?pending=true");
        return;
      }
      
      console.log("Setting user role:", profileData?.role, "name:", profileData?.name);
      setUserRole(profileData?.role ?? null);
      setUserName(profileData?.name ?? null);
      setLoading(false);
      console.log("Auth state updated successfully - loading set to false");
    } catch (error) {
      clearTimeout(timeoutId);
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
        console.log("Auth state changed:", event, "User:", session?.user?.email);
        await checkUserStatusAndSetStateWrapper(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
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
