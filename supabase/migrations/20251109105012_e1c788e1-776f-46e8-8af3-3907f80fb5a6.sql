-- Add policy to allow investors to view all creator profiles
CREATE POLICY "Investors can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'INVESTOR'::app_role));