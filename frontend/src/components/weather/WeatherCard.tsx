import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Wind, CloudRain, Calendar } from "lucide-react";
import type { WeatherLog } from "@/types/weather";
import { formatDate } from "@/utils/formatters";

interface WeatherCardProps {
    data: WeatherLog;
}

export function WeatherCard({ data }: WeatherCardProps) {
    return (
        <Card className="bg-gdash-card border-slate-700 text-white hover:border-gdash-primary/50 transition-colors">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <span>{data.location}</span>
                    <span className="flex items-center text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(data.createdAt)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">{data.temperature.toFixed(1)}</span>
                    <span className="text-xl text-slate-400 ml-1">°C</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center text-slate-400 mb-1">
                            <Droplets className="w-4 h-4 mr-1" />
                            <span className="text-xs">Umidade</span>
                        </div>
                        <span className="font-semibold">{data.humidity}%</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center text-slate-400 mb-1">
                            <Wind className="w-4 h-4 mr-1" />
                            <span className="text-xs">Vento</span>
                        </div>
                        <span className="font-semibold">{data.windSpeed} km/h</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center text-slate-400 mb-1">
                            <CloudRain className="w-4 h-4 mr-1" />
                            <span className="text-xs">Chuva</span>
                        </div>
                        <span className="font-semibold">{data.precipitation} mm</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
