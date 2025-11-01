import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

export default function Konfigurasi() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Konfigurasi Sistem</h1>
        <p className="text-muted-foreground mt-1">
          Atur aturan payroll dan komisi untuk perhitungan gaji.
        </p>
      </div>

      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payroll">Aturan Payroll</TabsTrigger>
          <TabsTrigger value="komisi">Aturan Komisi</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Aturan Payroll</CardTitle>
              <CardDescription>
                Konfigurasi aturan perhitungan gaji pokok kreator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Form konfigurasi aturan payroll akan segera hadir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="komisi" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Aturan Komisi</CardTitle>
              <CardDescription>
                Konfigurasi slab komisi progresif berdasarkan GMV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Form konfigurasi aturan komisi akan segera hadir.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
