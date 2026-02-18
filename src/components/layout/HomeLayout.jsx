import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MinimalStats from '../ui/MinimalStats';

const HomeLayout = ({ children, showStats = false, statsData = {} }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-4 z-50 mx-4 mt-4 rounded-2xl glass-panel border-white/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                Toron Metrologie
                            </h1>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-white/50 rounded-full transition-all text-slate-600 hover:text-red-600"
                            aria-label="Se déconnecter du système"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                    
                    {showStats && (
                        <MinimalStats 
                            toronCount={statsData.toronCount}
                            equipmentCount={statsData.equipmentCount}
                            expiredCount={statsData.expiredCount}
                        />
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 flex-grow animate-fade-in">
                {children}
            </main>

            <footer className="py-8 text-center text-slate-500 text-sm font-medium">
                <p>© 2026 Toron Metrologie • Système de Gestion Premium</p>
            </footer>
        </div>
    );
};

export default HomeLayout;
