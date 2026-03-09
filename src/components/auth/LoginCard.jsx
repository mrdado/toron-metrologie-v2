import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import freyssinetLogo from '../../assets/Freyssinet logo.png';

const LoginCard = ({ onLogin, onRegister, onLogout, onForgotPassword, error, success, loading, pendingApproval }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const loginButtonStyle = {
        width: '100%',
        marginTop: '24px',
        padding: '12px 16px',
        background: 'linear-gradient(90deg, var(--toron-primary) 0%, var(--toron-dark) 100%)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius)',
        fontWeight: 700,
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(75, 107, 166, 0.2)',
        opacity: loading ? 0.7 : 1
    };

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
            <div className="w-full max-w-md p-8 text-center animate-fade-in">
                <div className="mx-auto w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 shadow-md border border-amber-200">
                    <Clock className="text-amber-500 animate-pulse" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Compte en attente</h2>
                <div className="space-y-4 text-gray-600">
                    <p>Merci pour votre inscription, <span className="text-blue-600 font-semibold">{fullName || 'utilisateur'}</span> !</p>
                    <p className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm italic">
                        Votre demande d'accès est actuellement en cours d'examen par un administrateur.
                        Vous recevrez l'accès dès que votre compte sera approuvé.
                    </p>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center gap-4">
                    <button
                        onClick={onLogout}
                        className="text-blue-600 hover:text-blue-700 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <LogIn size={16} className="rotate-180" /> Retour à la connexion
                    </button>
                    <div className="flex justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md animate-fade-in">
            {/* Branding Section - Outside Card */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg flex items-center justify-center">
                        <img
                            src={freyssinetLogo}
                            alt="Freyssinet Logo"
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-blue-800 tracking-tight">
                        IPS TestLAB
                    </h1>
                </div>
                <p className="text-xs font-semibold capitalize tracking-widest" style={{ color: 'rgb(126, 132, 139)', fontSize: '13px', letterSpacing: '2px' }}>SYSTÈME DE GESTION D'INVENTAIRE</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-8 text-center border-b border-gray-100">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-600 to-blue-100 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight" style={{ marginTop: '24px' }}>
                        {isLogin ? 'Connexion' : 'Créer un compte'}
                    </h2>
                    <p className="text-sm font-medium" style={{ color: 'rgb(128, 129, 135)', marginBottom: '30px' }}>
                        {isLogin ? 'Accédez à votre compte' : 'Inscrivez-vous pour commencer'}
                    </p>
                </div>

                {/* Card Body */}
                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3 border border-red-200 text-sm animate-in">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-6 flex items-center gap-3 border border-emerald-200 text-sm animate-in">
                            <CheckCircle size={18} className="flex-shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 px-6">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Nom Complet</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input pl-11 w-full"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="text-gray-400" size={18} />
                                </div>
                                <input
                                    type="email"
                                    className="form-input pl-11 w-full"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Mot de Passe</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={() => onForgotPassword(email)}
                                        className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                                    >
                                        Oublié ?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-gray-400" size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="form-input pl-11 w-full"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-submit-btn"
                            style={loginButtonStyle}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                                    {isLogin ? 'Connexion en cours...' : 'Inscription en cours...'}
                                </span>
                            ) : (
                                <span>
                                    {isLogin ? 'Se Connecter' : 'S\'inscrire maintenant'}
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                        >
                            {isLogin ? (
                                <>Pas de compte ? <span className="text-blue-600 font-bold uppercase tracking-tight">S'inscrire</span></>
                            ) : (
                                <>Déjà un compte ? <span className="text-blue-600 font-bold uppercase tracking-tight">Se Connecter</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginCard;
