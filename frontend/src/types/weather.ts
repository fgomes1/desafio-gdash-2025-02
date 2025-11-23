export interface WeatherLog {
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

export type ExportFormat = 'csv' | 'xlsx';

export interface ApiError {
    message: string;
    statusCode?: number;
}

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}
