-- Add PENDING_APPROVAL status to user_status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';

-- Update handle_new_user function to set PENDING_APPROVAL for new creators
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Get the role from metadata, default to CREATOR
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'CREATOR');
  
  -- Insert profile with PENDING_APPROVAL status for new creators
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    user_role,
    CASE 
      WHEN user_role = 'CREATOR' THEN 'PENDING_APPROVAL'::user_status
      ELSE 'ACTIVE'::user_status
    END
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$function$;