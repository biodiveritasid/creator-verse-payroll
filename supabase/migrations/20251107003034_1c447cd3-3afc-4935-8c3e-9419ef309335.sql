-- Update investor_ledger table to add new fields
ALTER TABLE public.investor_ledger 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS proof_link TEXT;

-- Update the column name 'notes' to 'keterangan' for clarity (optional, keeping both for compatibility)
ALTER TABLE public.investor_ledger 
ADD COLUMN IF NOT EXISTS keterangan TEXT;