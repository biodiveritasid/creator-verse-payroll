import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function Sales() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Sales</h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan import data sales bulanan kreator.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Import Data Sales</CardTitle>
          <CardDescription>Upload data sales bulanan dari TikTok atau Shopee</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Import Data Sales
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Data Sales Bulanan</CardTitle>
          <CardDescription>Riwayat sales semua kreator</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Fitur ini akan segera hadir. Anda akan dapat melihat dan mengelola data sales bulanan di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
