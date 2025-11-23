import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
    return (
        <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription className="flex items-center justify-between mt-2">
                <span>{message}</span>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="border-red-800 hover:bg-red-900/50 text-red-200"
                    >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Tentar novamente
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
