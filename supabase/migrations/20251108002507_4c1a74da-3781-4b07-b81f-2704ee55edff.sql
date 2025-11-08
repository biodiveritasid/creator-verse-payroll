-- Fix privilege escalation: Make profiles.role read-only and sync with user_roles
-- This prevents direct manipulation of roles via the profiles table

-- Create trigger function to sync profiles.role from user_roles (read-only)
CREATE OR REPLACE FUNCTION public.sync_profile_role_from_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On INSERT, set role from user_roles (if exists), otherwise use default
  IF TG_OP = 'INSERT' THEN
    SELECT role INTO NEW.role
    FROM public.user_roles
    WHERE user_id = NEW.id
    LIMIT 1;
    
    -- If no role in user_roles yet, keep the default from the column
    IF NEW.role IS NULL THEN
      NEW.role := 'CREATOR'::app_role;
    END IF;
  END IF;
  
  -- On UPDATE, prevent direct role changes - always fetch from user_roles
  IF TG_OP = 'UPDATE' THEN
    SELECT role INTO NEW.role
    FROM public.user_roles
    WHERE user_id = NEW.id
    LIMIT 1;
    
    -- If no role found, keep existing
    IF NEW.role IS NULL THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce read-only role on profiles
DROP TRIGGER IF EXISTS enforce_profile_role_readonly ON public.profiles;
CREATE TRIGGER enforce_profile_role_readonly
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_from_user_roles();

COMMENT ON FUNCTION public.sync_profile_role_from_user_roles() IS 'Ensures profiles.role is always synced from user_roles table and cannot be directly modified';