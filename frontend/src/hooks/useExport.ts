import { useState } from 'react';
import { exportService } from '@/services/exportService';
import { useToast } from '@/hooks/use-toast';
import type { ExportFormat } from "@/types/weather";

export function useExport() {
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
    const { toast } = useToast();

    const handleExport = async () => {
        setExporting(true);
        try {
            if (exportFormat === 'csv') {
                await exportService.exportToCSV();
            } else {
                await exportService.exportToXLSX();
            }
            toast({
                title: "Sucesso",
                description: `Exportação para ${exportFormat.toUpperCase()} concluída.`,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha na exportação.",
            });
        } finally {
            setExporting(false);
        }
    };

    return { handleExport, exporting, exportFormat, setExportFormat };
}
