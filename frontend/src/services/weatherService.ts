import { api } from './api';
import type { WeatherLog } from '@/types/weather';

export const weatherService = {
    async fetchLogs(): Promise<WeatherLog[]> {
        const { data } = await api.get<WeatherLog[]>('/weather');
        return data;
    },

    async fetchInsight(): Promise<{ text: string }> {
        const { data } = await api.get<{ text: string }>('/weather/insight');
        return data;
    }
};
