import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeatherLog {
    temperature: number;
    humidity: number;
    createdAt: string;
}

interface WeatherChartProps {
    data: WeatherLog[];
}

export function WeatherChart({ data }: WeatherChartProps) {
    // Preparar dados: inverter para ordem cronológica e formatar data
    const chartData = [...data].reverse().map(log => ({
        ...log,
        temperature: Number(log.temperature.toFixed(1)),
        humidity: Number(log.humidity.toFixed(1)),
        time: format(new Date(log.createdAt), 'HH:mm', { locale: ptBR }),
        fullDate: format(new Date(log.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }),
    }));

    return (
        <div className="bg-gdash-card border border-slate-700 rounded-xl p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6">Variação de Temperatura e Umidade</h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            formatter={(value: number) => [value, '']}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                borderColor: '#334155',
                                color: '#f1f5f9',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#f1f5f9' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="temperature"
                            name="Temperatura (°C)"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="humidity"
                            name="Umidade (%)"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorHum)"
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
