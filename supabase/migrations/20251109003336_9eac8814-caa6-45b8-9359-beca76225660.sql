-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_role_from_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;