import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function Konten() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Konten</h1>
        <p className="text-muted-foreground mt-1">
          Catat postingan konten Anda untuk tracking performa.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Tambah Log Konten</CardTitle>
          <CardDescription>Catat link postingan konten Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Tambah Log Konten
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Histori Konten</CardTitle>
          <CardDescription>Riwayat postingan konten Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Belum ada log konten. Mulai catat postingan Anda!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
