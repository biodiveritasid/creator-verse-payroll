import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function Kreator() {
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
          <CardTitle>Daftar Kreator</CardTitle>
          <CardDescription>Kelola semua kreator dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Kreator Baru
            </Button>
            <p className="text-muted-foreground text-center py-8">
              Fitur manajemen kreator akan segera hadir. Anda akan dapat menambah, mengedit, dan mengelola data kreator di sini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
