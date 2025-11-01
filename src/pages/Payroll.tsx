import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

export default function Payroll() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan hitung gaji kreator secara otomatis.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Perhitungan Payroll Otomatis</CardTitle>
          <CardDescription>
            Klik tombol di bawah untuk menghitung dan menerbitkan draft payroll periode ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full md:w-auto">
            <Calculator className="h-4 w-4 mr-2" />
            Hitung & Terbitkan Draft Payroll
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Histori Payouts</CardTitle>
          <CardDescription>Riwayat pembayaran gaji kreator</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Fitur ini akan segera hadir. Anda akan dapat melihat dan mengelola semua histori payouts di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
