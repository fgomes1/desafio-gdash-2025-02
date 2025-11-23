import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherCardSkeleton() {
    return (
        <Card className="bg-gdash-card border-slate-700">
            <CardHeader className="pb-2">
                <CardTitle className="flex justify-between">
                    <Skeleton className="h-4 w-24 bg-slate-700" />
                    <Skeleton className="h-4 w-32 bg-slate-700" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline mb-4">
                    <Skeleton className="h-10 w-20 bg-slate-700" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-4 w-16 bg-slate-700" />
                        <Skeleton className="h-5 w-10 bg-slate-700" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-4 w-16 bg-slate-700" />
                        <Skeleton className="h-5 w-10 bg-slate-700" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-4 w-16 bg-slate-700" />
                        <Skeleton className="h-5 w-10 bg-slate-700" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
