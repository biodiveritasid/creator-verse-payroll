import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function Investor() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investor Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan finansial dan buku besar investor.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ringkasan Finansial</CardTitle>
          <CardDescription>Overview performa bisnis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dashboard investor dengan ringkasan finansial akan segera hadir.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ledger Investor</CardTitle>
          <CardDescription>Buku besar modal dan profit share</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Ledger investor akan segera hadir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
