import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightCardProps {
    insight: string | null;
    loading: boolean;
}

export function InsightCard({ insight, loading }: InsightCardProps) {
    if (loading) {
        return (
            <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30 mb-8">
                <CardHeader>
                    <Skeleton className="h-6 w-48 bg-slate-700" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full bg-slate-700 mb-2" />
                    <Skeleton className="h-4 w-3/4 bg-slate-700" />
                </CardContent>
            </Card>
        );
    }

    if (!insight) return null;

    return (
        <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-indigo-400 text-lg">
                    <Bot className="w-5 h-5 mr-2" />
                    Insight IA
                    <Sparkles className="w-4 h-4 ml-2 text-yellow-400 animate-pulse" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-indigo-100 leading-relaxed">
                    {insight}
                </p>
            </CardContent>
        </Card>
    );
}
