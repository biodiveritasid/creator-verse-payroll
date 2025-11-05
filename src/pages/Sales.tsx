import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SalesData {
  id: string;
  user_id: string;
  month: string;
  source: "TIKTOK" | "SHOPEE";
  gmv: number;
  orders: number;
  commission_gross: number;
  profiles?: {
    name: string;
  };
}

interface Creator {
  id: string;
  name: string;
}

export default function Sales() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    month: "",
    source: "TIKTOK" as "TIKTOK" | "SHOPEE",
    gmv: "",
    orders: "",
    commission_gross: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesResponse, creatorsResponse, profilesResponse] = await Promise.all([
        supabase
          .from("sales_bulanan")
          .select("*")
          .order("month", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "CREATOR")
          .eq("status", "ACTIVE"),
        supabase
          .from("profiles")
          .select("id, name")
      ]);

      if (salesResponse.error) throw salesResponse.error;
      if (creatorsResponse.error) throw creatorsResponse.error;
      if (profilesResponse.error) throw profilesResponse.error;

      // Manually join sales data with profiles
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.id, p]) || []);
      const salesWithProfiles = salesResponse.data?.map(sale => ({
        ...sale,
        profiles: profilesMap.get(sale.user_id)
      })) || [];

      setSalesData(salesWithProfiles);
      setCreators(creatorsResponse.data || []);
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
      const { error } = await supabase
        .from("sales_bulanan")
        .insert({
          user_id: formData.user_id,
          month: formData.month,
          source: formData.source,
          gmv: parseFloat(formData.gmv),
          orders: parseInt(formData.orders),
          commission_gross: parseFloat(formData.commission_gross)
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data sales berhasil ditambahkan"
      });

      setDialogOpen(false);
      setFormData({
        user_id: "",
        month: "",
        source: "TIKTOK",
        gmv: "",
        orders: "",
        commission_gross: ""
      });
      fetchData();
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

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const totalGMV = salesData.reduce((sum, s) => sum + s.gmv, 0);
  const totalOrders = salesData.reduce((sum, s) => sum + s.orders, 0);
  const totalCommission = salesData.reduce((sum, s) => sum + s.commission_gross, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Sales</h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan import data sales bulanan kreator.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGMV)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Sales Bulanan</CardTitle>
              <CardDescription>Riwayat sales semua kreator</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Data Sales
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Data Sales</DialogTitle>
                  <DialogDescription>
                    Input data sales bulanan kreator
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">Kreator</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kreator" />
                      </SelectTrigger>
                      <SelectContent>
                        {creators.map((creator) => (
                          <SelectItem key={creator.id} value={creator.id}>
                            {creator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Bulan</Label>
                    <Input
                      id="month"
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Sumber</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value: "TIKTOK" | "SHOPEE") => 
                        setFormData({ ...formData, source: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                        <SelectItem value="SHOPEE">Shopee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmv">GMV (IDR)</Label>
                    <Input
                      id="gmv"
                      type="number"
                      value={formData.gmv}
                      onChange={(e) => setFormData({ ...formData, gmv: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orders">Jumlah Orders</Label>
                    <Input
                      id="orders"
                      type="number"
                      value={formData.orders}
                      onChange={(e) => setFormData({ ...formData, orders: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_gross">Komisi Gross (IDR)</Label>
                    <Input
                      id="commission_gross"
                      type="number"
                      value={formData.commission_gross}
                      onChange={(e) => setFormData({ ...formData, commission_gross: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Simpan</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : salesData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada data sales. Mulai tambahkan data sales bulanan!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kreator</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Komisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.profiles?.name || "-"}
                    </TableCell>
                    <TableCell>{formatMonth(sale.month)}</TableCell>
                    <TableCell>{sale.source}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.gmv)}</TableCell>
                    <TableCell className="text-right">{sale.orders.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.commission_gross)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
