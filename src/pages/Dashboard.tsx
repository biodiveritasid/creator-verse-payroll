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
        // Use RPC function for optimized aggregation
        const { data, error } = await supabase.rpc("get_dashboard_stats_creator", {
          creator_user_id: user.id,
        });

        if (error) throw error;

        return data && data.length > 0
          ? {
              totalGMV: Number(data[0].total_gmv),
              totalCommission: Number(data[0].total_commission),
              totalMinutes: Number(data[0].total_minutes),
              totalPayout: Number(data[0].total_payout),
              estimatedBonus: Number(data[0].estimated_bonus),
            }
          : {
              totalGMV: 0,
              totalCommission: 0,
              totalMinutes: 0,
              totalPayout: 0,
              estimatedBonus: 0,
            };
      }

      if (userRole === "ADMIN" || userRole === "INVESTOR") {
        // Use RPC function for optimized aggregation
        const { data, error } = await supabase.rpc("get_dashboard_stats_admin");

        if (error) throw error;

        return data && data.length > 0
          ? {
              totalGMV: Number(data[0].total_gmv),
              totalCommission: Number(data[0].total_commission),
              totalCreators: Number(data[0].total_creators),
              totalPayout: Number(data[0].total_payout),
            }
          : {
              totalGMV: 0,
              totalCommission: 0,
              totalCreators: 0,
              totalPayout: 0,
            };
      }

      return null;
    },
    enabled: !!user && !!userRole,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
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
