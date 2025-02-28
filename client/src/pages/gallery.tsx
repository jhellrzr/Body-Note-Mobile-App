import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { PainEntry } from "@shared/schema";
import { generatePDF } from "@/lib/pdf";
import { useTranslation } from "react-i18next";

export default function Gallery() {
  const { t } = useTranslation();
  const { data: entries, isLoading } = useQuery<PainEntry[]>({
    queryKey: ["/api/pain-entries"],
  });

  if (isLoading) {
    return <div>{t('gallery.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('gallery.title')}</h1>
        <Button onClick={() => generatePDF(entries || [])}>
          <Download className="mr-2 h-4 w-4" />
          {t('gallery.exportPDF')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries?.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <img
                src={entry.imageUrl}
                alt={`Pain entry from ${entry.date.toString()}`}
                className="w-full h-48 object-cover rounded-md"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}