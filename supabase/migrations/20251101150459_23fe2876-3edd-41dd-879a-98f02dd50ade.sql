-- Create enum types
CREATE TYPE app_role AS ENUM ('ADMIN', 'CREATOR', 'INVESTOR');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'PAUSED');
CREATE TYPE shift_type AS ENUM ('MORNING', 'AFTERNOON');
CREATE TYPE sales_source AS ENUM ('TIKTOK', 'SHOPEE');
CREATE TYPE payout_status AS ENUM ('DRAFT', 'APPROVED', 'PAID');
CREATE TYPE ledger_type AS ENUM ('CAPITAL_IN', 'CAPITAL_OUT', 'PROFIT_SHARE');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'CREATOR',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  base_salary DECIMAL(15,2) DEFAULT 0,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tiktok_account TEXT,
  niche TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table for security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create AturanPayroll table (single config row)
CREATE TABLE public.aturan_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_live_target_minutes INTEGER NOT NULL DEFAULT 120,
  floor_pct DECIMAL(5,2) NOT NULL DEFAULT 0.60,
  cap_pct DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  minimum_minutes INTEGER NOT NULL DEFAULT 7800,
  minimum_policy TEXT NOT NULL DEFAULT 'prorata_with_flag',
  workdays INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  holidays DATE[] DEFAULT ARRAY[]::DATE[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create AturanKomisi table (single config row)
CREATE TABLE public.aturan_komisi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slabs JSONB NOT NULL DEFAULT '[
    {"min": 0, "max": 5000000, "rate": 0.00},
    {"min": 5000000, "max": 20000000, "rate": 0.20},
    {"min": 20000000, "max": 100000000, "rate": 0.30},
    {"min": 100000000, "max": 9000000000000000, "rate": 0.40}
  ]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create SalesBulanan table
CREATE TABLE public.sales_bulanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  gmv DECIMAL(15,2) NOT NULL DEFAULT 0,
  commission_gross DECIMAL(15,2) NOT NULL DEFAULT 0,
  orders INTEGER NOT NULL DEFAULT 0,
  source sales_source NOT NULL DEFAULT 'TIKTOK',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month, source)
);

-- Create SesiLive table
CREATE TABLE public.sesi_live (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  shift shift_type NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ContentLogs table
CREATE TABLE public.content_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  post_number INTEGER NOT NULL,
  link TEXT NOT NULL,
  is_counted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  base_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  base_salary_adjusted DECIMAL(15,2) NOT NULL DEFAULT 0,
  bonus_commission DECIMAL(15,2) NOT NULL DEFAULT 0,
  deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_payout DECIMAL(15,2) NOT NULL DEFAULT 0,
  below_minimum BOOLEAN DEFAULT FALSE,
  status payout_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create InvestorLedger table
CREATE TABLE public.investor_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type ledger_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'CREATOR')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'CREATOR')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aturan_payroll_updated_at BEFORE UPDATE ON public.aturan_payroll FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aturan_komisi_updated_at BEFORE UPDATE ON public.aturan_komisi FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sales_bulanan_updated_at BEFORE UPDATE ON public.sales_bulanan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sesi_live_updated_at BEFORE UPDATE ON public.sesi_live FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_logs_updated_at BEFORE UPDATE ON public.content_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aturan_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aturan_komisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_bulanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesi_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for aturan_payroll
CREATE POLICY "Anyone authenticated can view payroll rules" ON public.aturan_payroll FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update payroll rules" ON public.aturan_payroll FOR UPDATE USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can insert payroll rules" ON public.aturan_payroll FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for aturan_komisi
CREATE POLICY "Anyone authenticated can view commission rules" ON public.aturan_komisi FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update commission rules" ON public.aturan_komisi FOR UPDATE USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can insert commission rules" ON public.aturan_komisi FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for sales_bulanan
CREATE POLICY "Creators can view their own sales" ON public.sales_bulanan FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sales" ON public.sales_bulanan FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Investors can view all sales" ON public.sales_bulanan FOR SELECT USING (public.has_role(auth.uid(), 'INVESTOR'));
CREATE POLICY "Admins can manage sales" ON public.sales_bulanan FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for sesi_live
CREATE POLICY "Creators can view their own sessions" ON public.sesi_live FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Creators can insert their own sessions" ON public.sesi_live FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Creators can update their own sessions" ON public.sesi_live FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.sesi_live FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can manage sessions" ON public.sesi_live FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for content_logs
CREATE POLICY "Creators can view their own content logs" ON public.content_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Creators can insert their own content logs" ON public.content_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all content logs" ON public.content_logs FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can manage content logs" ON public.content_logs FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for payouts
CREATE POLICY "Creators can view their own payouts" ON public.payouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payouts" ON public.payouts FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Investors can view all payouts" ON public.payouts FOR SELECT USING (public.has_role(auth.uid(), 'INVESTOR'));
CREATE POLICY "Admins can manage payouts" ON public.payouts FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- RLS Policies for investor_ledger
CREATE POLICY "Investors can view ledger" ON public.investor_ledger FOR SELECT USING (public.has_role(auth.uid(), 'INVESTOR'));
CREATE POLICY "Admins can view ledger" ON public.investor_ledger FOR SELECT USING (public.has_role(auth.uid(), 'ADMIN'));
CREATE POLICY "Admins can manage ledger" ON public.investor_ledger FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- Insert default configuration
INSERT INTO public.aturan_payroll (
  daily_live_target_minutes,
  floor_pct,
  cap_pct,
  minimum_minutes,
  minimum_policy,
  workdays,
  holidays
) VALUES (
  120,
  0.60,
  1.00,
  7800,
  'prorata_with_flag',
  ARRAY[1,2,3,4,5],
  ARRAY[]::DATE[]
);

INSERT INTO public.aturan_komisi (slabs) VALUES (
  '[
    {"min": 0, "max": 5000000, "rate": 0.00},
    {"min": 5000000, "max": 20000000, "rate": 0.20},
    {"min": 20000000, "max": 100000000, "rate": 0.30},
    {"min": 100000000, "max": 9000000000000000, "rate": 0.40}
  ]'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_sales_bulanan_user_month ON public.sales_bulanan(user_id, month);
CREATE INDEX idx_sesi_live_user_date ON public.sesi_live(user_id, check_in);
CREATE INDEX idx_payouts_user_period ON public.payouts(user_id, period_start, period_end);
CREATE INDEX idx_content_logs_user_date ON public.content_logs(user_id, date);