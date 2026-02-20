import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserCheck, UserX, Clock, Shield, ArrowLeft, Search, User, Bell, Users, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        if (!isAdmin) return;

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
        <div className="min-h-screen w-full p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 hover:bg-gray-200 rounded-xl text-gray-700 transition-all">
                        <ArrowLeft size={24} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield size={32} style={{color: 'var(--toron-primary)'}} /> Administration
                        </h1>
                        <p className="text-gray-600 text-sm">Gestion des utilisateurs et alertes</p>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="form-input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: 'rgba(255, 193, 7, 0.1)', color: '#F59E0B'}}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{pendingUsers.length}</p>
                                <p className="text-gray-600 text-sm font-medium">En Attente</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow" style={{borderLeftWidth: '4px', borderLeftColor: 'var(--toron-primary)'}}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{background: 'rgba(75, 107, 166, 0.1)', color: 'var(--toron-primary)'}}>
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-gray-900">{allUsers.length}</p>
                                <p className="text-gray-600 text-sm font-medium">Utilisateurs Actifs</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 flex bg-gray-50">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${
                                activeTab === 'pending'
                                    ? 'text-white border-b-2'
                                    : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900'
                            }`}
                            style={{
                                background: activeTab === 'pending' ? 'var(--toron-primary)' : 'transparent',
                                borderBottomColor: activeTab === 'pending' ? 'var(--toron-primary)' : 'transparent'
                            }}
                        >
                            DEMANDES ({pendingUsers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 px-6 py-4 font-bold text-sm transition-all ${
                                activeTab === 'all'
                                    ? 'text-white border-b-2'
                                    : 'text-gray-600 border-b-2 border-transparent hover:text-gray-900'
                            }`}
                            style={{
                                background: activeTab === 'all' ? 'var(--toron-primary)' : 'transparent',
                                borderBottomColor: activeTab === 'all' ? 'var(--toron-primary)' : 'transparent'
                            }}
                        >
                            TOUS LES UTILISATEURS
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">
                                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4 animate-spin"></div>
                                Chargement...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 italic">
                                {activeTab === 'pending' ? 'Aucune demande en attente.' : 'Aucun utilisateur trouvé.'}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-100 transition-colors border border-gray-200">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                user.isApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                <User size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-gray-900">{user.fullName || 'Sans nom'}</h4>
                                                    {user.isAdmin && (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wider">Admin</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm flex items-center gap-1">
                                                    <Mail size={14} /> {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-center flex-wrap justify-end sm:justify-start">
                                            {user.isApproved ? (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleAlerts(user.id, user.expirationAlertsEnabled)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                            user.expirationAlertsEnabled
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                                                : 'bg-gray-200 text-gray-600 border-gray-300'
                                                        }`}
                                                    >
                                                        <Bell size={14} className={user.expirationAlertsEnabled ? 'animate-pulse' : ''} />
                                                        <span className="hidden sm:inline">{user.expirationAlertsEnabled ? 'ON' : 'OFF'}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeny(user.id)}
                                                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                                                        title="Supprimer l'utilisateur"
                                                    >
                                                        <UserX size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleDeny(user.id)}
                                                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                                                    >
                                                        <UserX size={14} /> Refuser
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold text-white"
                                                        style={{background: 'var(--toron-primary)'}}
                                                    >
                                                        <UserCheck size={14} /> Approuver
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
