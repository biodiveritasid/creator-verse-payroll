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
  date: string;
  source: "TIKTOK" | "SHOPEE";
  gmv: number;
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: "TIKTOK" as "TIKTOK" | "SHOPEE",
    gmv: "",
    commission_gross: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      const salesResponse = await supabase
        .from("penjualan_harian")
        .select("*")
        .order("date", { ascending: false });

      if (salesResponse.error) throw salesResponse.error;

      const profilesResponse = await supabase
        .from("profiles")
        .select("id, name");

      if (profilesResponse.error) throw profilesResponse.error;

      // Manually join sales data with profiles
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.id, p]) || []);
      const salesWithProfiles = salesResponse.data?.map(sale => ({
        ...sale,
        profiles: profilesMap.get(sale.user_id)
      })) || [];

      setSalesData(salesWithProfiles);
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
            ? "Lihat laporan penjualan harian dari semua kreator." 
            : "Input laporan penjualan harian Anda."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
              <CardTitle>Laporan Penjualan Harian</CardTitle>
              <CardDescription>
                {currentUser?.role === "ADMIN" 
                  ? "Riwayat penjualan semua kreator" 
                  : "Riwayat penjualan Anda"}
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Laporan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Laporan Penjualan</DialogTitle>
                  <DialogDescription>
                    Input laporan penjualan harian
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Platform</Label>
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
                    <Label htmlFor="commission_gross">Komisi (IDR)</Label>
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
              Belum ada data penjualan. Mulai tambahkan laporan penjualan harian!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {currentUser?.role === "ADMIN" && <TableHead>Kreator</TableHead>}
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Komisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.id}>
                    {currentUser?.role === "ADMIN" && (
                      <TableCell className="font-medium">
                        {sale.profiles?.name || "-"}
                      </TableCell>
                    )}
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{sale.source}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.gmv)}</TableCell>
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
