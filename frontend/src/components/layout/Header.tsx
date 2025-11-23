import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useExport } from "@/hooks/useExport";

interface HeaderProps {
    onRefresh: () => void;
    loading: boolean;
    lastUpdated: Date | null;
}

export function Header({ onRefresh, loading }: HeaderProps) {
    const { handleExport, exporting, exportFormat, setExportFormat } = useExport();

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Monitoramento <span className="text-gdash-primary">Climático</span>
                </h1>
                <p className="text-slate-400 mt-1">
                    Dados em tempo real de temperatura e umidade
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-gdash-card border border-slate-700 rounded-lg p-1">
                    <Button
                        variant={exportFormat === 'csv' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setExportFormat('csv')}
                        className="text-xs h-7"
                    >
                        CSV
                    </Button>
                    <Button
                        variant={exportFormat === 'xlsx' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setExportFormat('xlsx')}
                        className="text-xs h-7"
                    >
                        XLSX
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={exporting}
                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? 'Exportando...' : 'Exportar'}
                </Button>

                <Button
                    onClick={onRefresh}
                    disabled={loading}
                    className="bg-gdash-primary text-gdash-dark hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-900/20"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>
        </div>
    );
}
