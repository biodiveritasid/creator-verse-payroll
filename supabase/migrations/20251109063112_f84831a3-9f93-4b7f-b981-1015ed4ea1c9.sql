-- Add bank information columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN nama_bank TEXT,
ADD COLUMN nomor_rekening TEXT,
ADD COLUMN nama_pemilik_rekening TEXT;