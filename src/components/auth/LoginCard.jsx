import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

const LoginCard = ({ onLogin, onRegister, onLogout, error, loading, pendingApproval }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setFullName('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(email, password);
        } else {
            onRegister(email, password, fullName);
        }
    };

    if (pendingApproval) {
        return (
            <div className="glass-card w-full max-w-md p-8 text-center animate-in">
                <div className="mx-auto w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 shadow-xl border border-amber-500/30">
                    <Clock className="text-amber-400 animate-pulse" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Compte en attente</h2>
                <div className="space-y-4 text-slate-300">
                    <p>Merci pour votre inscription, <span className="text-indigo-400 font-semibold">{fullName || 'utilisateur'}</span> !</p>
                    <p className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm italic">
                        Votre demande d'accès est actuellement en cours d'examen par un administrateur.
                        Vous recevrez l'accès dès que votre compte sera approuvé.
                    </p>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col items-center gap-4">
                    <button
                        onClick={onLogout}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <LogIn size={16} className="rotate-180" /> Retour à la connexion
                    </button>
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card w-full max-w-md overflow-hidden animate-in">
            {/* Header */}
            <div className="relative p-8 text-center bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-b border-white/10">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl rotate-3 transform hover:rotate-6 transition-transform">
                    {isLogin ? <Lock className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
                </div>
                <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">
                    {isLogin ? 'Connexion' : 'Créer un compte'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">IPS TestLAB Inventory System</p>
            </div>

            {/* Form */}
            <div className="p-8">
                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-500/20 text-sm animate-in">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nom Complet</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="glass-input form-input pl-11 w-full py-3.5"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Proféssionnel</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            </div>
                            <input
                                type="email"
                                className="glass-input form-input pl-11 w-full py-3.5"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mot de passe</label>
                            {isLogin && <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Oublié ?</a>}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            </div>
                            <input
                                type="password"
                                className="glass-input form-input pl-11 w-full py-3.5"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        className="w-full justify-center py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 border-none transform active:scale-[0.98] transition-all"
                    >
                        {isLogin ? (
                            <span className="flex items-center gap-2">
                                Se Connecter <ChevronRight size={18} />
                            </span>
                        ) : (
                            'S\'inscrire maintenant'
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={toggleMode}
                        className="text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLogin ? (
                            <>Pas de compte ? <span className="text-indigo-400 font-bold uppercase tracking-tight">S'inscrire</span></>
                        ) : (
                            <>Déjà un compte ? <span className="text-indigo-400 font-bold uppercase tracking-tight">Se Connecter</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginCard;
