import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MinimalStats from '../ui/MinimalStats';
import freyssinetLogo from '../../assets/Freyssinet logo.png';

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
                        <div className="flex items-center gap-4">
                            <img 
                                src={freyssinetLogo} 
                                alt="Freyssinet Logo" 
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                className="shadow-sm"
                            />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                IPS TestLAB
                            </h1>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-white/50 rounded-full transition-all text-slate-600 hover:text-red-600"
                            aria-label="Se déconnecter du système"
                        >
                            <Power size={24} />
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
                <p>© 2026 IPS TestLAB • Système de Gestion Premium</p>
            </footer>
        </div>
    );
};

export default HomeLayout;
