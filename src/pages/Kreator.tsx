import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Creator {
  id: string;
  name: string;
  email: string;
  tiktok_account: string | null;
  niche: string | null;
  base_salary: number | null;
  join_date: string;
  status: string;
}

export default function Kreator() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tiktok_account: "",
    niche: "",
    base_salary: "",
    join_date: new Date().toISOString().split('T')[0],
    status: "ACTIVE" as "ACTIVE" | "PAUSED",
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "CREATOR")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat data kreator: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingCreator) {
        // Update existing creator
        const { error } = await supabase
          .from("profiles")
          .update({
            name: formData.name,
            tiktok_account: formData.tiktok_account || null,
            niche: formData.niche || null,
            base_salary: parseFloat(formData.base_salary) || 0,
            join_date: formData.join_date,
            status: formData.status,
          })
          .eq("id", editingCreator.id);

        if (error) throw error;
        toast.success("Kreator berhasil diperbarui");
      } else {
        // Create new creator via auth (role is set via trigger)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          // Update additional profile fields
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              tiktok_account: formData.tiktok_account || null,
              niche: formData.niche || null,
              base_salary: parseFloat(formData.base_salary) || 0,
              join_date: formData.join_date,
              status: formData.status,
            })
            .eq("id", authData.user.id);

          if (updateError) throw updateError;
        }

        toast.success("Kreator baru berhasil ditambahkan");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCreators();
    } catch (error: any) {
      toast.error("Gagal menyimpan data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      tiktok_account: "",
      niche: "",
      base_salary: "",
      join_date: new Date().toISOString().split('T')[0],
      status: "ACTIVE" as "ACTIVE" | "PAUSED",
    });
    setEditingCreator(null);
  };

  const handleEdit = (creator: Creator) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name,
      email: creator.email,
      password: "",
      tiktok_account: creator.tiktok_account || "",
      niche: creator.niche || "",
      base_salary: creator.base_salary?.toString() || "",
      join_date: creator.join_date,
      status: creator.status as "ACTIVE" | "PAUSED",
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kelola Kreator</h1>
        <p className="text-muted-foreground mt-1">
          Tambah, edit, dan kelola data kreator afiliasi.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Kreator</CardTitle>
              <CardDescription>Kelola semua kreator dalam sistem</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Tambah Kreator Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingCreator ? "Edit Kreator" : "Tambah Kreator Baru"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCreator 
                      ? "Perbarui informasi kreator"
                      : "Isi form di bawah untuk menambah kreator baru"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingCreator}
                    />
                  </div>
                  {!editingCreator && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="tiktok_account">Akun TikTok</Label>
                    <Input
                      id="tiktok_account"
                      value={formData.tiktok_account}
                      onChange={(e) => setFormData({ ...formData, tiktok_account: e.target.value })}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niche">Niche</Label>
                    <Input
                      id="niche"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      placeholder="Fashion, Gaming, dll."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_salary">Gaji Pokok (Rp) *</Label>
                    <Input
                      id="base_salary"
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join_date">Tanggal Bergabung *</Label>
                    <Input
                      id="join_date"
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "ACTIVE" | "PAUSED") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Memuat data...</p>
          ) : creators.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Belum ada kreator. Klik tombol di atas untuk menambahkan.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>TikTok</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead>Gaji Pokok</TableHead>
                    <TableHead>Tgl Bergabung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.map((creator) => (
                    <TableRow key={creator.id}>
                      <TableCell className="font-medium">{creator.name}</TableCell>
                      <TableCell>{creator.email}</TableCell>
                      <TableCell>{creator.tiktok_account || "-"}</TableCell>
                      <TableCell>{creator.niche || "-"}</TableCell>
                      <TableCell>{formatCurrency(creator.base_salary)}</TableCell>
                      <TableCell>{new Date(creator.join_date).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          creator.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                          {creator.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(creator)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
