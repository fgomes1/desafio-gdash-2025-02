import { useState, useEffect } from 'react';
import { weatherService } from '@/services/weatherService';

export function useWeatherInsight(trigger: any) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                const data = await weatherService.fetchInsight();
                setInsight(data.text);
            } catch (error) {
                console.error('Failed to fetch insight:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [trigger]); // Recarrega quando 'trigger' mudar (ex: logs atualizados)

    return { insight, loading };
}
