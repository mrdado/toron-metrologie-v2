import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserCheck, UserX, Clock, Shield, ArrowLeft, Search, User, Bell, BellOff, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import '../styles/MeshBackground.css';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

    useEffect(() => {
        if (!isAdmin) return;

        // Fetch ALL users to manage permissions and alerts
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
            setLoading(false);
        });

        return unsubscribe;
    }, [isAdmin]);

    const handleApprove = async (userId) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                isApproved: true,
                approvedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Erreur lors de l'approbation.");
        }
    };

    const handleToggleAlerts = async (userId, currentState) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                expirationAlertsEnabled: !currentState
            });
        } catch (error) {
            console.error("Error updating alert preference:", error);
        }
    };

    const handleDeny = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir refuser cet accès ?")) {
            try {
                await deleteDoc(doc(db, 'users', userId));
            } catch (error) {
                console.error("Error denying user:", error);
            }
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const pendingUsers = users.filter(u => u.isApproved === false);
    const allUsers = users.filter(u => u.isApproved === true);

    const filteredUsers = (activeTab === 'pending' ? pendingUsers : allUsers).filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full p-4 md:p-8 relative overflow-hidden">
            <div className="mesh-background"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Shield className="text-indigo-400" /> Administration
                            </h1>
                            <p className="text-slate-400">Gestion des utilisateurs et alertes</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="glass-input form-input pl-10 w-full py-2.5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Stats Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{pendingUsers.length}</p>
                                <p className="text-slate-400 text-sm">En attente</p>
                            </div>
                        </div>

                        <div className="glass-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{allUsers.length}</p>
                                <p className="text-slate-400 text-sm">Utilisateurs actifs</p>
                            </div>
                        </div>
                    </div>

                    {/* List Card */}
                    <div className="lg:col-span-3">
                        <div className="glass-card overflow-hidden">
                            <div className="border-b border-white/10 flex bg-white/5">
                                <button
                                    onClick={() => setActiveTab('pending')}
                                    className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'pending' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-slate-400 hover:text-white'}`}
                                >
                                    DEMANDES ({pendingUsers.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-6 py-4 font-bold text-sm transition-all ${activeTab === 'all' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-slate-400 hover:text-white'}`}
                                >
                                    TOUS LES UTILISATEURS
                                </button>
                            </div>

                            <div className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-400">Chargement...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 italic">
                                        {activeTab === 'pending' ? 'Aucune demande en attente.' : 'Aucun utilisateur trouvé.'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {filteredUsers.map(user => (
                                            <div key={user.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold">{user.fullName || 'Sans nom'}</h4>
                                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {user.isAdmin && <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider border border-indigo-500/20">Admin</span>}
                                                            <span className="text-[10px] text-slate-500 font-mono">ID: {user.id}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 items-center">
                                                    {user.isApproved ? (
                                                        <>
                                                            {/* Alert Toggle */}
                                                            <button
                                                                onClick={() => handleToggleAlerts(user.id, user.expirationAlertsEnabled)}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${user.expirationAlertsEnabled
                                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                                    : 'bg-slate-500/10 text-slate-400 border-white/10'
                                                                    }`}
                                                            >
                                                                <Bell size={16} className={user.expirationAlertsEnabled ? 'animate-pulse' : ''} />
                                                                {user.expirationAlertsEnabled ? 'Alertes ON' : 'Alertes OFF'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeny(user.id)}
                                                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                                                                title="Supprimer l'utilisateur"
                                                            >
                                                                <UserX size={18} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleDeny(user.id)}
                                                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                                                            >
                                                                <UserX size={18} /> Refuser
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(user.id)}
                                                                className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                                                            >
                                                                <UserCheck size={18} /> Approuver
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}\n
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
