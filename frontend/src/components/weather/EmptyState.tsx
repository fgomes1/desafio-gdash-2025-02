import { CloudOff } from "lucide-react";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-gdash-card/50 rounded-xl border border-dashed border-slate-700">
            <CloudOff className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-300">Sem dados climáticos</h3>
            <p className="text-sm max-w-xs text-center mt-2">
                Não há registros disponíveis no momento. Tente atualizar ou verifique se o coletor está rodando.
            </p>
        </div>
    );
}
