import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown, Plus, Upload, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface LedgerEntry {
  id: string;
  date: string;
  type: "CAPITAL_IN" | "CAPITAL_OUT" | "PROFIT_SHARE";
  amount: number;
  title: string;
  keterangan: string | null;
  proof_link: string | null;
}

export default function Keuangan() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "CAPITAL_IN" as "CAPITAL_IN" | "CAPITAL_OUT",
    amount: "",
    title: "",
    keterangan: "",
    proof_link: ""
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
      setLedgerEntries(data as any || []);
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
          date: new Date(formData.date).toISOString(),
          type: formData.type,
          amount: parseFloat(formData.amount),
          title: formData.title,
          keterangan: formData.keterangan || null,
          proof_link: formData.proof_link || null
        } as any);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan"
      });

      setDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: "CAPITAL_IN",
        amount: "",
        title: "",
        keterangan: "",
        proof_link: ""
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
        date: new Date(row.Tanggal).toISOString(),
        type: row.Tipe === 'PEMASUKAN' ? 'CAPITAL_IN' : 'CAPITAL_OUT',
        amount: parseFloat(row.Nominal || 0),
        title: row.Judul || '',
        keterangan: row.Keterangan || null,
        proof_link: row.Bukti || null
      }));

      const { error } = await supabase
        .from("investor_ledger")
        .insert(entries as any);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${entries.length} transaksi berhasil diimpor`
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

  const downloadTemplate = () => {
    const template = [
      {
        Tanggal: '2025-01-01',
        Judul: 'Contoh Pemasukan',
        Tipe: 'PEMASUKAN',
        Nominal: 1000000,
        Keterangan: 'Deskripsi transaksi',
        Bukti: 'https://link-bukti.com'
      },
      {
        Tanggal: '2025-01-02',
        Judul: 'Contoh Pengeluaran',
        Tipe: 'PENGELUARAN',
        Nominal: 500000,
        Keterangan: 'Deskripsi transaksi',
        Bukti: 'https://link-bukti.com'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template-keuangan.xlsx");
  };

  const calculateSummary = () => {
    const income = ledgerEntries
      .filter(e => e.type === "CAPITAL_IN")
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expense = ledgerEntries
      .filter(e => e.type === "CAPITAL_OUT")
      .reduce((sum, e) => sum + e.amount, 0);

    const net = income - expense;
    return { income, expense, net };
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
      CAPITAL_IN: "Pemasukan",
      CAPITAL_OUT: "Pengeluaran",
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.net)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaksi Keuangan</CardTitle>
              <CardDescription>Kelola pemasukan dan pengeluaran agensi</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate} size="sm">
                <TrendingDown className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="excel-upload"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Impor Excel
                </Button>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Transaksi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Transaksi</DialogTitle>
                    <DialogDescription>
                      Catat transaksi keuangan baru
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
                      <Label htmlFor="title">Judul</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Misal: Gaji Kreator Bulan Januari"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipe</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "CAPITAL_IN" | "CAPITAL_OUT") => 
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAPITAL_IN">Pemasukan</SelectItem>
                          <SelectItem value="CAPITAL_OUT">Pengeluaran</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Nominal (Rp)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="1000000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keterangan">Keterangan</Label>
                      <Textarea
                        id="keterangan"
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        placeholder="Deskripsi transaksi..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proof_link">Bukti (Link)</Label>
                      <Input
                        id="proof_link"
                        type="url"
                        value={formData.proof_link}
                        onChange={(e) => setFormData({ ...formData, proof_link: e.target.value })}
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <Button type="submit" className="w-full">Simpan</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Bukti</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell className="font-medium">{entry.title}</TableCell>
                    <TableCell>
                      <span className={entry.type === 'CAPITAL_IN' ? 'text-green-600' : 'text-red-600'}>
                        {getTypeLabel(entry.type)}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${entry.type === 'CAPITAL_IN' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {entry.keterangan || "-"}
                    </TableCell>
                    <TableCell>
                      {entry.proof_link ? (
                        <a 
                          href={entry.proof_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Lihat
                        </a>
                      ) : '-'}
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
