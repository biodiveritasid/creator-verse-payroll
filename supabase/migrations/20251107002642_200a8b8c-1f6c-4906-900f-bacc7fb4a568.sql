-- Drop any potentially broken constraints first
ALTER TABLE public.content_logs DROP CONSTRAINT IF EXISTS content_logs_user_id_fkey;
ALTER TABLE public.sesi_live DROP CONSTRAINT IF EXISTS sesi_live_user_id_fkey;
ALTER TABLE public.payouts DROP CONSTRAINT IF EXISTS payouts_user_id_fkey;
ALTER TABLE public.penjualan_harian DROP CONSTRAINT IF EXISTS penjualan_harian_user_id_fkey;

-- Now add the foreign key relationships fresh
ALTER TABLE public.content_logs
ADD CONSTRAINT content_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.sesi_live
ADD CONSTRAINT sesi_live_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.payouts
ADD CONSTRAINT payouts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.penjualan_harian
ADD CONSTRAINT penjualan_harian_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;