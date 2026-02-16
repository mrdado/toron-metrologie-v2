import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-4 z-50 mx-4 mt-4 rounded-2xl glass-panel border-white/50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {!isHome && (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/50 rounded-full transition-all text-slate-700 hover:text-indigo-600 hover:shadow-sm"
                                aria-label="Retour"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/30 transition-shadow">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent font-outfit tracking-tight">
                                Toron Metrologie
                            </h1>
                        </Link>
                    </div>

                    <Link to="/" className="p-2 hover:bg-white/50 rounded-full transition-all text-slate-600 hover:text-indigo-600">
                        <Home size={24} />
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow animate-fade-in">
                {children}
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm font-medium">
                <p>© 2026 Toron Metrologie • Système de Gestion Premium</p>
            </footer>
        </div>
    );
};

export default Layout;
