import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    // Calculate yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    const yesterdayDateStr = yesterdayDate.split('-').join('-'); // YYYY-MM-DD

    let dataContext = '';
    let systemPrompt = '';

    if (profile.role === 'CREATOR') {
      // Fetch creator data for yesterday
      const [liveSessions, sales, contentLogs] = await Promise.all([
        supabaseClient
          .from('sesi_live')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', yesterdayDateStr),
        supabaseClient
          .from('penjualan_harian')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', yesterdayDate),
        supabaseClient
          .from('content_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', yesterdayDateStr)
      ]);

      const totalMinutes = liveSessions.data?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;
      const totalGMV = sales.data?.reduce((acc, s) => acc + Number(s.gmv || 0), 0) || 0;
      const totalCommission = sales.data?.reduce((acc, s) => acc + Number(s.commission_gross || 0), 0) || 0;
      const totalPosts = contentLogs.data?.length || 0;

      dataContext = `Data performa kreator ${profile.name} untuk tanggal ${yesterdayDate}:
- Total Jam Live: ${Math.floor(totalMinutes / 60)} jam ${totalMinutes % 60} menit
- Total GMV (penjualan): Rp ${totalGMV.toLocaleString('id-ID')}
- Total Komisi Kotor: Rp ${totalCommission.toLocaleString('id-ID')}
- Jumlah Konten yang Diposting: ${totalPosts} postingan`;

      systemPrompt = `Anda adalah asisten AI yang membantu kreator afiliasi memahami performa mereka. Berikan ringkasan yang ramah, motivatif, dan actionable dalam Bahasa Indonesia. Gunakan emoji yang relevan. Format output dalam markdown. Mulai dengan sapaan personal menggunakan nama kreator. Berikan insight singkat dan saran untuk hari ini berdasarkan performa kemarin.`;

    } else if (profile.role === 'ADMIN' || profile.role === 'INVESTOR') {
      // Fetch admin/investor aggregate data for yesterday
      const [allSales, topCreators, pendingApprovals, borrowedItems] = await Promise.all([
        supabaseClient
          .from('penjualan_harian')
          .select('gmv, commission_gross')
          .eq('date', yesterdayDate),
        supabaseClient
          .from('penjualan_harian')
          .select('user_id, gmv, profiles(name)')
          .eq('date', yesterdayDate)
          .order('gmv', { ascending: false })
          .limit(3),
        supabaseClient
          .from('profiles')
          .select('name')
          .eq('status', 'PENDING_APPROVAL'),
        supabaseClient
          .from('inventory_items')
          .select('nama_barang, peminjam_id, profiles(name)')
          .eq('status', 'Dipinjam')
      ]);

      const totalGMV = allSales.data?.reduce((acc, s) => acc + Number(s.gmv || 0), 0) || 0;
      const totalCommission = allSales.data?.reduce((acc, s) => acc + Number(s.commission_gross || 0), 0) || 0;

      // Get live session data
      const { data: liveSessions } = await supabaseClient
        .from('sesi_live')
        .select('duration_minutes')
        .eq('date', yesterdayDateStr);

      const totalMinutes = liveSessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0;

      let topCreatorsText = 'Tidak ada data penjualan.';
      if (topCreators.data && topCreators.data.length > 0) {
        topCreatorsText = topCreators.data
          .map((c: any, i: number) => `${i + 1}. ${c.profiles?.name || 'Unknown'}: Rp ${Number(c.gmv).toLocaleString('id-ID')}`)
          .join('\n');
      }

      const pendingCount = pendingApprovals.data?.length || 0;
      const borrowedItemsList = borrowedItems.data?.map((item: any) => 
        `- ${item.nama_barang} (dipinjam oleh ${item.profiles?.name || 'Unknown'})`
      ).join('\n') || 'Tidak ada barang yang dipinjam.';

      dataContext = `Data performa agensi untuk tanggal ${yesterdayDate}:
- Total GMV Seluruh Kreator: Rp ${totalGMV.toLocaleString('id-ID')}
- Total Komisi Kotor: Rp ${totalCommission.toLocaleString('id-ID')}
- Total Jam Live Seluruh Kreator: ${Math.floor(totalMinutes / 60)} jam ${totalMinutes % 60} menit

Top 3 Kreator berdasarkan GMV:
${topCreatorsText}

Kreator Menunggu Approval: ${pendingCount} orang
${pendingCount > 0 ? `(${pendingApprovals.data?.map((p: any) => p.name).join(', ')})` : ''}

Inventaris Dipinjam:
${borrowedItemsList}`;

      systemPrompt = `Anda adalah asisten AI yang membantu admin/investor agensi afiliasi memahami performa bisnis mereka. Berikan ringkasan yang profesional, informatif, dan actionable dalam Bahasa Indonesia. Gunakan emoji yang relevan. Format output dalam markdown. Soroti insight penting dan berikan rekomendasi aksi jika diperlukan.`;
    }

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dataContext }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Silakan coba lagi nanti.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Kredit AI habis. Silakan top up di Settings > Workspace > Usage.');
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('Gagal memanggil AI Gateway');
    }

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || 'Tidak ada ringkasan tersedia.';

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-summary-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
