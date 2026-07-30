import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="card max-w-md w-full text-center space-y-4 shadow-xl border border-red-100 bg-white p-6 rounded-2xl">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Une erreur s'est produite</h2>
                        <p className="text-sm text-gray-600">
                            L'affichage de cette page a rencontré un problème. Cela peut arriver si les données chargées contiennent un format inattendu.
                        </p>
                        {this.state.error?.message && (
                            <div className="bg-red-50 p-3 rounded-lg text-left text-xs font-mono text-red-700 overflow-x-auto">
                                {this.state.error.message}
                            </div>
                        )}
                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Recharger la page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="btn btn-outline flex items-center justify-center gap-2"
                            >
                                <Home size={18} />
                                Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
