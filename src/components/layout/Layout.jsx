import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import freyssinetLogo from '../../assets/Freyssinet logo.png';

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
                        <Link to="/" className="flex items-center gap-4 group">
                            <img 
                                src={freyssinetLogo} 
                                alt="Freyssinet Logo" 
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                className="shadow-sm group-hover:shadow-md transition-shadow"
                            />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                IPS TestLAB
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

            <footer className="py-8 text-center text-slate-500 text-sm font-medium">
                <p>© 2026 IPS TestLAB • Système de Gestion Premium</p>
            </footer>
        </div>
    );
};

export default Layout;
