-- Drop existing sales_bulanan table and create new penjualan_harian table
DROP TABLE IF EXISTS public.sales_bulanan;

-- Create penjualan_harian table for daily sales reports
CREATE TABLE public.penjualan_harian (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source sales_source NOT NULL DEFAULT 'TIKTOK',
  gmv NUMERIC NOT NULL DEFAULT 0,
  commission_gross NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, source)
);

-- Enable RLS
ALTER TABLE public.penjualan_harian ENABLE ROW LEVEL SECURITY;

-- Creators can insert their own daily sales
CREATE POLICY "Creators can insert their own sales"
ON public.penjualan_harian
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'CREATOR'::app_role));

-- Creators can update their own daily sales
CREATE POLICY "Creators can update their own sales"
ON public.penjualan_harian
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'CREATOR'::app_role));

-- Creators can view their own sales
CREATE POLICY "Creators can view their own sales"
ON public.penjualan_harian
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND has_role(auth.uid(), 'CREATOR'::app_role));

-- Admins can view all sales
CREATE POLICY "Admins can view all sales"
ON public.penjualan_harian
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Admins can manage all sales
CREATE POLICY "Admins can manage all sales"
ON public.penjualan_harian
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Investors can view all sales
CREATE POLICY "Investors can view all sales"
ON public.penjualan_harian
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'INVESTOR'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_penjualan_harian_updated_at
BEFORE UPDATE ON public.penjualan_harian
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();