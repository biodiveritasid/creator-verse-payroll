-- Fix 1: Add RLS policy for users to update their own non-sensitive profile fields
-- Note: We cannot reference OLD in WITH CHECK, so we rely on the trigger to protect role
CREATE POLICY "Users can update their own non-sensitive profile fields"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix 2: Update handle_new_user trigger to always use 'CREATOR' for public signups
-- Remove dependency on role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Always use CREATOR role for public signups
  -- Admin users should be created via admin panel, not public signup
  INSERT INTO public.profiles (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'CREATOR'::app_role,
    'PENDING_APPROVAL'::user_status
  );
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'CREATOR'::app_role);
  
  RETURN NEW;
END;
$function$;