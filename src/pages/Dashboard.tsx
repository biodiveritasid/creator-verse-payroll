import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";

export default function Dashboard() {
  const { user, userRole } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id, userRole],
    queryFn: async () => {
      if (!user) return null;

      if (userRole === "CREATOR") {
        const { data, error } = await supabase.rpc('get_dashboard_stats_creator', {
          creator_user_id: user.id
        });

        if (error) throw error;

        const result = data?.[0];
        return {
          totalGMV: result?.total_gmv || 0,
          totalCommission: result?.total_commission || 0,
          totalMinutes: result?.total_minutes || 0,
          totalPayout: result?.total_payout || 0,
          estimatedBonus: result?.estimated_bonus || 0,
        };
      }

      if (userRole === "ADMIN" || userRole === "INVESTOR") {
        const { data, error } = await supabase.rpc('get_dashboard_stats_admin');

        if (error) throw error;

        const result = data?.[0];
        return {
          totalGMV: result?.total_gmv || 0,
          totalCommission: result?.total_commission || 0,
          totalCreators: result?.total_creators || 0,
          totalPayout: result?.total_payout || 0,
        };
      }

      return null;
    },
    enabled: !!user && !!userRole,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali! Ini adalah ringkasan performa Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userRole === "CREATOR" && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalGMV || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gross Merchandise Value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalCommission || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Komisi kotor dari sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jam Live</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round((stats?.totalMinutes || 0) / 60)} jam</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.totalMinutes || 0} menit total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gaji</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{formatCurrency(stats?.totalPayout || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gaji yang sudah dibayar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimasi Bonus Saat Ini</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(stats?.estimatedBonus || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Berdasarkan GMV saat ini</p>
              </CardContent>
            </Card>
          </>
        )}

        {(userRole === "ADMIN" || userRole === "INVESTOR") && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalGMV || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Seluruh kreator</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalCommission || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Komisi kotor total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jumlah Kreator</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCreators || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Kreator aktif</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatCurrency(stats?.totalPayout || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Gaji yang dibayar</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
