-- Drop existing functions first
DROP FUNCTION IF EXISTS get_dashboard_stats_admin();
DROP FUNCTION IF EXISTS get_dashboard_stats_creator(uuid);
DROP FUNCTION IF EXISTS get_creator_sales_stats_by_range(date, date);

-- Create RPC function for admin/investor dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats_admin()
RETURNS TABLE (
  total_gmv numeric,
  total_commission numeric,
  total_creators bigint,
  total_payout numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ph.gmv), 0) as total_gmv,
    COALESCE(SUM(ph.commission_gross), 0) as total_commission,
    (SELECT COUNT(*) FROM profiles WHERE role = 'CREATOR' AND status = 'ACTIVE') as total_creators,
    COALESCE((SELECT SUM(p.total_payout) FROM payouts p WHERE p.status = 'PAID'), 0) as total_payout
  FROM penjualan_harian ph;
END;
$$;

-- Create RPC function for creator dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats_creator(creator_user_id uuid)
RETURNS TABLE (
  total_gmv numeric,
  total_commission numeric,
  total_minutes bigint,
  total_payout numeric,
  estimated_bonus numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_gmv numeric;
  v_total_commission numeric;
  v_commission_rule_id uuid;
  v_slabs jsonb;
  v_slab jsonb;
  v_estimated_bonus numeric := 0;
BEGIN
  -- Get totals
  SELECT 
    COALESCE(SUM(ph.gmv), 0),
    COALESCE(SUM(ph.commission_gross), 0)
  INTO v_total_gmv, v_total_commission
  FROM penjualan_harian ph
  WHERE ph.user_id = creator_user_id;

  -- Get commission rule and calculate bonus
  SELECT id_aturan_komisi INTO v_commission_rule_id
  FROM profiles
  WHERE id = creator_user_id;

  IF v_commission_rule_id IS NOT NULL AND v_total_gmv > 0 THEN
    SELECT slabs INTO v_slabs
    FROM aturan_komisi
    WHERE id = v_commission_rule_id;

    IF v_slabs IS NOT NULL THEN
      -- Find the highest applicable slab
      FOR v_slab IN SELECT * FROM jsonb_array_elements(v_slabs) ORDER BY (value->>'min')::numeric DESC
      LOOP
        IF v_total_gmv >= (v_slab->>'min')::numeric THEN
          v_estimated_bonus := ROUND(v_total_commission * (v_slab->>'rate')::numeric);
          EXIT;
        END IF;
      END LOOP;
    END IF;
  END IF;

  -- Return all stats
  RETURN QUERY
  SELECT 
    v_total_gmv as total_gmv,
    v_total_commission as total_commission,
    COALESCE((SELECT SUM(sl.duration_minutes) FROM sesi_live sl WHERE sl.user_id = creator_user_id), 0) as total_minutes,
    COALESCE((SELECT SUM(p.total_payout) FROM payouts p WHERE p.user_id = creator_user_id AND p.status = 'PAID'), 0) as total_payout,
    v_estimated_bonus as estimated_bonus;
END;
$$;

-- Create RPC function for sales stats by date range
CREATE OR REPLACE FUNCTION get_creator_sales_stats_by_range(start_date date, end_date date)
RETURNS TABLE (
  user_id uuid,
  name text,
  gmv numeric,
  commission numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.user_id,
    p.name,
    COALESCE(SUM(ph.gmv), 0) as gmv,
    COALESCE(SUM(ph.commission_gross), 0) as commission
  FROM penjualan_harian ph
  INNER JOIN profiles p ON p.id = ph.user_id
  WHERE ph.date >= start_date AND ph.date <= end_date
  GROUP BY ph.user_id, p.name
  ORDER BY gmv DESC;
END;
$$;