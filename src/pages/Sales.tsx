import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SalesStatsCards from "@/components/sales/SalesStatsCards";
import CreatorSalesTable from "@/components/sales/CreatorSalesTable";
import DailySalesTable from "@/components/sales/DailySalesTable";
import AddSalesDialog from "@/components/sales/AddSalesDialog";
import DateRangeFilter from "@/components/sales/DateRangeFilter";

interface SalesData {
  id: string;
  user_id: string;
  date: string;
  source: "TIKTOK" | "SHOPEE";
  gmv: number;
  commission_gross: number;
  profiles?: {
    name: string;
  };
}

interface CreatorSales {
  user_id: string;
  name: string;
  gmv: number;
  commission: number;
}

export default function Sales() {
  const { userRole } = useAuth();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [creatorSales, setCreatorSales] = useState<CreatorSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filterType, setFilterType] = useState<"daily" | "weekly" | "monthly" | "custom">("daily");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: "TIKTOK" as "TIKTOK" | "SHOPEE",
    gmv: "",
    commission_gross: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      applyDateFilter();
    }
  }, [currentUser, filterType]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
  };

  const getDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (filterType) {
      case "daily":
        start = today;
        end = today;
        break;
      case "weekly":
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case "monthly":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const applyDateFilter = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      let query = supabase
        .from("penjualan_harian")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false });

      // Filter by user for creators
      if (currentUser?.role === "CREATOR") {
        query = query.eq("user_id", currentUser.id);
      }

      const salesResponse = await query;
      if (salesResponse.error) throw salesResponse.error;

      const profilesResponse = await supabase
        .from("profiles")
        .select("id, name");

      if (profilesResponse.error) throw profilesResponse.error;

      const profilesMap = new Map(profilesResponse.data?.map(p => [p.id, p]) || []);
      const salesWithProfiles = salesResponse.data?.map(sale => ({
        ...sale,
        profiles: profilesMap.get(sale.user_id)
      })) || [];

      setSalesData(salesWithProfiles);

      // Use RPC function for creator stats aggregation
      if (currentUser?.role === "ADMIN") {
        const { data: creatorStatsData, error: statsError } = await supabase.rpc(
          "get_creator_sales_stats_by_range",
          {
            start_date: start,
            end_date: end,
          }
        );

        if (statsError) throw statsError;

        setCreatorSales(creatorStatsData || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("penjualan_harian")
        .insert({
          user_id: user.id,
          date: formData.date,
          source: formData.source,
          gmv: parseFloat(formData.gmv),
          commission_gross: parseFloat(formData.commission_gross)
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data penjualan berhasil ditambahkan"
      });

      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        source: "TIKTOK",
        gmv: "",
        commission_gross: ""
      });
      applyDateFilter();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  const totalGMV = salesData.reduce((sum, s) => sum + s.gmv, 0);
  const totalCommission = salesData.reduce((sum, s) => sum + s.commission_gross, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Penjualan Harian</h1>
        <p className="text-muted-foreground mt-1">
          {currentUser?.role === "ADMIN" 
            ? "Statistik dan laporan penjualan harian dari semua kreator" 
            : "Input laporan penjualan harian Anda"}
        </p>
      </div>

      <DateRangeFilter
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApplyFilter={applyDateFilter}
      />

      <SalesStatsCards
        totalGMV={totalGMV}
        totalCommission={totalCommission}
        formatCurrency={formatCurrency}
      />

      {currentUser?.role === "ADMIN" ? (
        <>
          <CreatorSalesTable
            creatorSales={creatorSales}
            formatCurrency={formatCurrency}
            loading={loading}
          />
          
          <DailySalesTable
            salesData={salesData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            loading={loading}
            showCreatorColumn={true}
          />
        </>
      ) : (
        <>
          {userRole !== 'INVESTOR' && (
            <div className="flex justify-end">
              <AddSalesDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          <DailySalesTable
            salesData={salesData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            loading={loading}
            showCreatorColumn={false}
          />
        </>
      )}
    </div>
  );
}
