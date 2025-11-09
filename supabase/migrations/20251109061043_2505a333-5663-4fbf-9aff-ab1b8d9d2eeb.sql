-- Add nama_aturan column to aturan_komisi
ALTER TABLE public.aturan_komisi 
ADD COLUMN nama_aturan TEXT NOT NULL DEFAULT 'Aturan Default';

-- Add hourly_rate and id_aturan_komisi columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN hourly_rate NUMERIC(15,2) DEFAULT 0,
ADD COLUMN id_aturan_komisi UUID;

-- Add foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_aturan_komisi 
FOREIGN KEY (id_aturan_komisi) 
REFERENCES public.aturan_komisi(id) 
ON DELETE SET NULL;