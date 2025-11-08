-- Security fix: Restrict investor_ledger access to ADMIN and INVESTOR roles only
-- Remove the current overly permissive policies

DROP POLICY IF EXISTS "Admins can manage ledger" ON public.investor_ledger;
DROP POLICY IF EXISTS "Admins can view ledger" ON public.investor_ledger;
DROP POLICY IF EXISTS "Investors can view ledger" ON public.investor_ledger;

-- Create new restrictive policies
CREATE POLICY "Admins and investors can view ledger"
  ON public.investor_ledger
  FOR SELECT
  USING (
    has_role(auth.uid(), 'ADMIN'::app_role) OR 
    has_role(auth.uid(), 'INVESTOR'::app_role)
  );

CREATE POLICY "Only admins can insert ledger entries"
  ON public.investor_ledger
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Only admins can update ledger entries"
  ON public.investor_ledger
  FOR UPDATE
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

CREATE POLICY "Only admins can delete ledger entries"
  ON public.investor_ledger
  FOR DELETE
  USING (has_role(auth.uid(), 'ADMIN'::app_role));