import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function DailySummaryCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-summary-ai"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('daily-summary-ai');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Ringkasan Harian AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Ringkasan Harian AI</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gagal memuat ringkasan. Silakan refresh halaman.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Ringkasan Harian AI</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-relaxed space-y-3">
          <ReactMarkdown 
            className="[&>p]:mb-2 [&>ul]:mb-2 [&>ul]:ml-4 [&>ul>li]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-3 [&>strong]:font-semibold [&>strong]:text-foreground"
            components={{
              p: ({ children }) => <p className="text-muted-foreground mb-2">{children}</p>,
              ul: ({ children }) => <ul className="list-none space-y-1 ml-0">{children}</ul>,
              li: ({ children }) => <li className="text-muted-foreground flex items-start gap-1.5"><span className="mt-0.5">•</span><span className="flex-1">{children}</span></li>,
              strong: ({ children }) => <strong className="text-foreground font-semibold block mb-2 text-xs uppercase tracking-wide">{children}</strong>,
            }}
          >
            {data?.summary || 'Tidak ada ringkasan tersedia.'}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
