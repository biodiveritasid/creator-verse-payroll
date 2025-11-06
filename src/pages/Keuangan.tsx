import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown, Plus, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface LedgerEntry {
  id: string;
  date: string;
  type: "CAPITAL_IN" | "CAPITAL_OUT" | "PROFIT_SHARE";
  amount: number;
  notes: string | null;
}

export default function Keuangan() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "CAPITAL_IN" as "CAPITAL_IN" | "CAPITAL_OUT" | "PROFIT_SHARE",
    amount: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const { data, error } = await supabase
        .from("investor_ledger")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setLedgerEntries(data || []);
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
        .from("investor_ledger")
        .insert({
          date: formData.date,
          type: formData.type,
          amount: parseFloat(formData.amount),
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Entry ledger berhasil ditambahkan"
      });

      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: "CAPITAL_IN",
        amount: "",
        notes: ""
      });
      fetchLedger();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and insert data
      const entries = jsonData.map((row: any) => ({
        date: row.tanggal || row.date || new Date().toISOString().split('T')[0],
        type: row.tipe || row.type || "CAPITAL_IN",
        amount: parseFloat(row.jumlah || row.amount || 0),
        notes: row.catatan || row.notes || null
      }));

      const { error } = await supabase
        .from("investor_ledger")
        .insert(entries);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${entries.length} entry berhasil diimport dari Excel`
      });

      fetchLedger();
      e.target.value = "";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculateSummary = () => {
    const capitalIn = ledgerEntries
      .filter(e => e.type === "CAPITAL_IN")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const capitalOut = ledgerEntries
      .filter(e => e.type === "CAPITAL_OUT")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const profitShare = ledgerEntries
      .filter(e => e.type === "PROFIT_SHARE")
      .reduce((sum, e) => sum + e.amount, 0);

    const net = capitalIn - capitalOut - profitShare;
    return { capitalIn, capitalOut, profitShare, net };
  };

  const summary = calculateSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      CAPITAL_IN: "Modal Masuk",
      CAPITAL_OUT: "Modal Keluar",
      PROFIT_SHARE: "Bagi Hasil"
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola pemasukan dan pengeluaran keuangan agensi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modal Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.capitalIn)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modal Keluar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.capitalOut)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bagi Hasil</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.profitShare)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.net)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ledger Investor</CardTitle>
              <CardDescription>Buku besar modal dan profit share</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Entry
                </Button>
              </DialogTrigger>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="excel-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel
                  </label>
                </Button>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Entry Ledger</DialogTitle>
                  <DialogDescription>
                    Catat transaksi modal, bagi hasil, atau pengeluaran
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
                    <Label htmlFor="type">Tipe Transaksi</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "CAPITAL_IN" | "CAPITAL_OUT" | "PROFIT_SHARE") => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CAPITAL_IN">Modal Masuk</SelectItem>
                        <SelectItem value="CAPITAL_OUT">Modal Keluar</SelectItem>
                        <SelectItem value="PROFIT_SHARE">Bagi Hasil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (IDR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Keterangan tambahan..."
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
          ) : ledgerEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Belum ada entry ledger. Mulai catat transaksi!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{getTypeLabel(entry.type)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.notes || "-"}
                    </TableCell>
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
