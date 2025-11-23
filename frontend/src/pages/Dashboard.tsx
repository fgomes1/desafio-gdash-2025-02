import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LogOut, RefreshCw, Download, Sparkles, Bot, Droplets, Wind, CloudRain, Calendar, AlertCircle } from 'lucide-react';
import { PokemonInsight } from '@/components/dashboard/PokemonInsight';
import { WeatherChart } from '@/components/dashboard/WeatherChart';

interface WeatherLog {
    _id: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
    location: string;
    collectedAt: string;
    createdAt: string;
}

export function Dashboard() {
    const [logs, setLogs] = useState<WeatherLog[]>([]);
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [insightLoading, setInsightLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayCount, setDisplayCount] = useState(12); // Mostrar apenas 12 cards inicialmente

    const api = axios.create({
        baseURL: 'http://localhost:3000',
        timeout: 10000,
    });

    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", {
            locale: ptBR,
        });
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await api.get('/weather', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const fetchInsight = async () => {
        if (logs.length === 0) return;

        try {
            setInsightLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get('/weather/insight', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInsight(response.data.text);
        } catch (err) {
            console.error('Erro ao buscar insight:', err);
        } finally {
            setInsightLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get(`/weather/export/${format}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `weather-data.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Erro ao exportar:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            fetchInsight();
        }
    }, [logs]);

    const getHourlyLogs = (allLogs: WeatherLog[]) => {
        const hourlyLogs: WeatherLog[] = [];
        const seenHours = new Set<string>();

        for (const log of allLogs) {
            const date = new Date(log.createdAt);
            // Cria uma chave única para cada hora (ex: "2023-11-23T14")
            const hourKey = date.toISOString().substring(0, 13);

            if (!seenHours.has(hourKey)) {
                seenHours.add(hourKey);
                hourlyLogs.push(log);
            }

            if (hourlyLogs.length >= 24) break;
        }

        return hourlyLogs;
    };

    return (
        <div className="min-h-screen bg-gdash-bg text-white">
            {/* Header */}
            <header className="bg-gdash-card border-b border-slate-700 sticky top-0 z-10 backdrop-blur-sm bg-gdash-card/95">
                <div className="max-w-7xl mx-auto px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-gdash-primary to-purple-500 bg-clip-text text-transparent">
                            Weather Dashboard
                        </h1>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={fetchLogs}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gdash-primary hover:bg-gdash-primary/80 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Atualizar
                            </button>

                            <div className="relative group">
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                                    <Download className="w-4 h-4" />
                                    Exportar
                                </button>
                                <div className="absolute right-0 mt-2 w-40 bg-gdash-card border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full px-4 py-2 hover:bg-slate-700 text-left rounded-t-lg"
                                    >
                                        Exportar CSV
                                    </button>
                                    <button
                                        onClick={() => handleExport('xlsx')}
                                        className="w-full px-4 py-2 hover:bg-slate-700 text-left rounded-b-lg"
                                    >
                                        Exportar Excel
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    </div>

                    {logs.length > 0 && (
                        <p className="text-sm text-slate-400 mt-2">
                            Última atualização: {formatDate(logs[0].createdAt)}
                        </p>
                    )}
                </div>
            </header>

            <main className="p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-200">{error}</p>
                                <button
                                    onClick={fetchLogs}
                                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Top Section: Chart + Pokemon */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weather Chart */}
                        <div className="lg:col-span-2 h-full">
                            {logs.length > 0 ? (
                                <WeatherChart data={getHourlyLogs(logs)} />
                            ) : (
                                <div className="bg-gdash-card border border-slate-700 rounded-xl p-6 h-full flex items-center justify-center text-slate-400">
                                    Aguardando dados...
                                </div>
                            )}
                        </div>

                        {/* Pokemon Insight */}
                        <div className="lg:col-span-1 h-full">
                            <PokemonInsight />
                        </div>
                    </div>

                    {/* AI Text Insight */}
                    {insight && (
                        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-lg p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center text-indigo-400 text-lg mb-2">
                                <Bot className="w-5 h-5 mr-2" />
                                Insight IA
                                <Sparkles className="w-4 h-4 ml-2 text-yellow-400 animate-pulse" />
                            </div>
                            <p className="text-indigo-100 leading-relaxed">{insight}</p>
                        </div>
                    )}

                    {/* Weather Cards Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-gdash-card border border-slate-700 rounded-lg p-6 animate-pulse">
                                    <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
                                    <div className="h-8 w-20 bg-slate-700 rounded mb-4"></div>
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                                        <div className="h-12 bg-slate-700 rounded"></div>
                                        <div className="h-12 bg-slate-700 rounded"></div>
                                        <div className="h-12 bg-slate-700 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            Nenhum dado de clima disponível
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {logs.slice(0, displayCount).map((log) => (
                                    <div
                                        key={log._id}
                                        className="bg-gdash-card border border-slate-700 text-white hover:border-gdash-primary/50 transition-colors rounded-lg overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="p-6 pb-2">
                                            <div className="text-sm font-medium text-slate-400 flex items-center justify-between">
                                                <span>{log.location}</span>
                                                <span className="flex items-center text-xs">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {formatDate(log.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="px-6 pb-6">
                                            <div className="flex items-baseline mb-4">
                                                <span className="text-4xl font-bold text-white">
                                                    {log.temperature.toFixed(1)}
                                                </span>
                                                <span className="text-xl text-slate-400 ml-1">°C</span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center text-slate-400 mb-1">
                                                        <Droplets className="w-4 h-4 mr-1" />
                                                        <span className="text-xs">Umidade</span>
                                                    </div>
                                                    <span className="font-semibold">{log.humidity.toFixed(1)}%</span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center text-slate-400 mb-1">
                                                        <Wind className="w-4 h-4 mr-1" />
                                                        <span className="text-xs">Vento</span>
                                                    </div>
                                                    <span className="font-semibold">{log.windSpeed.toFixed(1)} km/h</span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center text-slate-400 mb-1">
                                                        <CloudRain className="w-4 h-4 mr-1" />
                                                        <span className="text-xs">Chuva</span>
                                                    </div>
                                                    <span className="font-semibold">{log.precipitation.toFixed(1)} mm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Botão Carregar Mais */}
                            {displayCount < logs.length && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={() => setDisplayCount(prev => prev + 12)}
                                        className="px-6 py-3 bg-gdash-primary hover:bg-gdash-primary/80 rounded-lg transition-colors font-medium"
                                    >
                                        Carregar mais ({logs.length - displayCount} restantes)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
