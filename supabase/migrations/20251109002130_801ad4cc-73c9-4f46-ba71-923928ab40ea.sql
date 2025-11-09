-- Add ARCHIVED status to user_status enum
ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'ARCHIVED';

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_barang TEXT NOT NULL,
  kategori TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Tersedia',
  peminjam_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_items
CREATE POLICY "Admins can manage inventory"
  ON public.inventory_items
  FOR ALL
  USING (has_role(auth.uid(), 'ADMIN'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.inventory_items IS 'Inventory tracking for agency equipment and samples';