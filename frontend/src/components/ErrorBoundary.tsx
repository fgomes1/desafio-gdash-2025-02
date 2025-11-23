import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
                    <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-6 border border-red-500/50">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Algo deu errado</h1>
                        <pre className="bg-slate-950 p-4 rounded overflow-auto text-sm font-mono text-red-200">
                            {this.state.error?.toString()}
                        </pre>
                        <p className="mt-4 text-slate-400">
                            Verifique o console do navegador para mais detalhes.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
