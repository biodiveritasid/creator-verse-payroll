-- Create RPC function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard_data(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  total_gmv NUMERIC,
  total_minutes INTEGER,
  total_posts BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.name,
    COALESCE(SUM(ph.gmv), 0) as total_gmv,
    COALESCE(SUM(sl.duration_minutes), 0)::INTEGER as total_minutes,
    COALESCE(COUNT(DISTINCT cl.id), 0) as total_posts
  FROM profiles p
  LEFT JOIN penjualan_harian ph ON ph.user_id = p.id 
    AND ph.date >= start_date 
    AND ph.date <= end_date
  LEFT JOIN sesi_live sl ON sl.user_id = p.id 
    AND sl.date >= to_char(start_date, 'YYYY-MM-DD')
    AND sl.date <= to_char(end_date, 'YYYY-MM-DD')
  LEFT JOIN content_logs cl ON cl.user_id = p.id 
    AND cl.date >= to_char(start_date, 'YYYY-MM-DD')
    AND cl.date <= to_char(end_date, 'YYYY-MM-DD')
  WHERE p.role = 'CREATOR' 
    AND p.status = 'ACTIVE'
  GROUP BY p.id, p.name
  ORDER BY p.name;
$$;