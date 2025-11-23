import type { WeatherLog } from "@/types/weather";
import { WeatherCard } from "./WeatherCard";
import { WeatherCardSkeleton } from "./WeatherCardSkeleton";
import { EmptyState } from "./EmptyState";

interface WeatherGridProps {
    logs: WeatherLog[];
    loading: boolean;
}

export function WeatherGrid({ logs, loading }: WeatherGridProps) {
    if (loading && logs.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <WeatherCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!loading && logs.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {logs.map((log) => (
                <WeatherCard key={log._id} data={log} />
            ))}
        </div>
    );
}
