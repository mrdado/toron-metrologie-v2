import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserCheck, UserX, Clock, Shield, ArrowLeft, Search, User } from 'lucide-react';
import Button from '../components/ui/Button';
import '../styles/MeshBackground.css';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAuth();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, 'users'), where('isApproved', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingUsers(users);
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

    const handleDeny = async (userId) => {
        if (window.confirm("Êtes-vous sûr de vouloir refuser cet accès ?")) {
            try {
                // For now, we just delete the Firestore doc. 
                // The user will remain in Auth but won't have a profile to get past PrivateRoute.
                await deleteDoc(doc(db, 'users', userId));
            } catch (error) {
                console.error("Error denying user:", error);
            }
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const filteredUsers = pendingUsers.filter(user =>
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
                            <p className="text-slate-400">Gestion des accès utilisateurs</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{pendingUsers.length}</p>
                                <p className="text-slate-400 text-sm">Demandes en attente</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-indigo-400" /> Infos Admin
                            </h3>
                            <div className="space-y-3 text-sm text-slate-300">
                                <p>Connecté en tant que:</p>
                                <p className="text-indigo-400 font-mono bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                                    {currentUser.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* List Card */}
                    <div className="lg:col-span-2">
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-bold text-white">Demandes d'inscription</h2>
                            </div>

                            <div className="p-0">
                                {loading ? (
                                    <div className="p-12 text-center text-slate-400">Chargement...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 italic">
                                        Aucune demande en attente.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/10">
                                        {filteredUsers.map(user => (
                                            <div key={user.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                                        <User size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold">{user.fullName || 'Sans nom'}</h4>
                                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {user.id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
