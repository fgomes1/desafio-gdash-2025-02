import { useState, useEffect, useCallback } from 'react';
import type { WeatherLog } from '@/types/weather';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';

export function useWeatherData() {
    const [logs, setLogs] = useState<WeatherLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const data = await weatherService.fetchLogs();
            // Ordenar por data decrescente (mais recente primeiro)
            const sortedData = data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setLogs(sortedData);
        } catch (err) {
            setError('Falha ao carregar dados climáticos.');
            if (!silent) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Não foi possível atualizar os dados.",
                });
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return { logs, loading, error, refresh: () => fetchData(false) };
}
