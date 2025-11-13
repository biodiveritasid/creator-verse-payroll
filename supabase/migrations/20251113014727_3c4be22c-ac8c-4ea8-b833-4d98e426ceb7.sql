-- Function to get dashboard stats for ADMIN/INVESTOR
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_admin()
RETURNS TABLE(
  total_gmv numeric,
  total_commission numeric,
  total_creators bigint,
  total_payout numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(SUM(ph.gmv), 0) as total_gmv,
    COALESCE(SUM(ph.commission_gross), 0) as total_commission,
    (SELECT COUNT(DISTINCT id) FROM profiles WHERE role = 'CREATOR' AND status = 'ACTIVE') as total_creators,
    COALESCE((SELECT SUM(total_payout) FROM payouts WHERE status = 'PAID'), 0) as total_payout
  FROM penjualan_harian ph;
$$;

-- Function to get dashboard stats for CREATOR
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_creator(creator_user_id uuid)
RETURNS TABLE(
  total_gmv numeric,
  total_commission numeric,
  total_minutes integer,
  total_payout numeric,
  estimated_bonus numeric
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_gmv numeric;
  v_total_commission numeric;
  v_estimated_bonus numeric := 0;
  v_slabs jsonb;
BEGIN
  -- Get sales totals
  SELECT 
    COALESCE(SUM(gmv), 0),
    COALESCE(SUM(commission_gross), 0)
  INTO v_total_gmv, v_total_commission
  FROM penjualan_harian
  WHERE user_id = creator_user_id;
  
  -- Calculate estimated bonus
  IF v_total_gmv > 0 THEN
    SELECT slabs INTO v_slabs FROM aturan_komisi LIMIT 1;
    
    IF v_slabs IS NOT NULL THEN
      -- Find applicable slab
      WITH slab_data AS (
        SELECT 
          (value->>'min')::numeric as min_val,
          (value->>'rate')::numeric as rate_val
        FROM jsonb_array_elements(v_slabs) AS value
        WHERE (value->>'min')::numeric <= v_total_gmv
        ORDER BY (value->>'min')::numeric DESC
        LIMIT 1
      )
      SELECT ROUND(v_total_commission * rate_val) INTO v_estimated_bonus
      FROM slab_data;
    END IF;
  END IF;
  
  RETURN QUERY
  SELECT 
    v_total_gmv,
    v_total_commission,
    COALESCE((SELECT SUM(duration_minutes)::integer FROM sesi_live WHERE user_id = creator_user_id), 0),
    COALESCE((SELECT SUM(total_payout) FROM payouts WHERE user_id = creator_user_id AND status = 'PAID'), 0),
    COALESCE(v_estimated_bonus, 0);
END;
$$;

-- Function to get creator sales stats by date range
CREATE OR REPLACE FUNCTION public.get_creator_sales_stats_by_range(start_date date, end_date date)
RETURNS TABLE(
  user_id uuid,
  name text,
  gmv numeric,
  commission numeric
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.name,
    COALESCE(SUM(ph.gmv), 0) as gmv,
    COALESCE(SUM(ph.commission_gross), 0) as commission
  FROM profiles p
  LEFT JOIN penjualan_harian ph ON ph.user_id = p.id 
    AND ph.date >= start_date 
    AND ph.date <= end_date
  WHERE p.role = 'CREATOR' AND p.status = 'ACTIVE'
  GROUP BY p.id, p.name
  HAVING COALESCE(SUM(ph.gmv), 0) > 0 OR COALESCE(SUM(ph.commission_gross), 0) > 0
  ORDER BY p.name;
$$;