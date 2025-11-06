import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface DailySalesTableProps {
  salesData: SalesData[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  loading: boolean;
  showCreatorColumn: boolean;
}

export default function DailySalesTable({ 
  salesData, 
  formatCurrency, 
  formatDate, 
  loading,
  showCreatorColumn 
}: DailySalesTableProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Laporan Penjualan Harian</CardTitle>
        <CardDescription>Riwayat penjualan harian</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : salesData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Belum ada data penjualan pada periode ini.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {showCreatorColumn && <TableHead>Kreator</TableHead>}
                <TableHead>Tanggal</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">GMV</TableHead>
                <TableHead className="text-right">Komisi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  {showCreatorColumn && (
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
  );
}
