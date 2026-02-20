import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { UserCheck, UserX, ArrowLeft, Bell } from 'lucide-react';

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
        <div className="min-h-screen w-full p-4 md:p-8" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)'}}>
            <div className="max-w-4xl mx-auto">
                {/* Header Bar - Back Button + Search */}
                <div className="flex items-center gap-3 mb-6">
                    <Link 
                        to="/" 
                        className="flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all flex-shrink-0"
                        aria-label="Retour à l'accueil"
                    >
                        <ArrowLeft size={20} className="text-gray-700" />
                    </Link>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Stats Cards - Gradient Style */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div 
                        className="rounded-2xl p-6 text-center border shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderColor: '#fcd34d'
                        }}
                    >
                        <div className="text-4xl font-bold text-gray-900 mb-1">{pendingUsers.length}</div>
                        <div className="text-xs text-gray-600 uppercase font-semibold tracking-wider">En Attente</div>
                    </div>

                    <div 
                        className="rounded-2xl p-6 text-center border shadow-sm"
                        style={{
                            background: 'linear-gradient(135deg, #c7d2e8 0%, #a8bde0 100%)',
                            borderColor: '#4B6BA6'
                        }}
                    >
                        <div className="text-4xl font-bold text-gray-900 mb-1">{allUsers.length}</div>
                        <div className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Actifs</div>
                    </div>
                </div>

                {/* Tabs - Outlined/Filled Style */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                            activeTab === 'pending'
                                ? 'text-white'
                                : 'bg-white text-gray-700 border-2 hover:border-gray-400'
                        }`}
                        style={{
                            background: activeTab === 'pending' ? '#4B6BA6' : 'white',
                            borderColor: activeTab === 'pending' ? '#4B6BA6' : '#4B6BA6'
                        }}
                    >
                        Demandes ({pendingUsers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                            activeTab === 'all'
                                ? 'text-white'
                                : 'bg-white text-gray-700 border-2 hover:border-gray-400'
                        }`}
                        style={{
                            background: activeTab === 'all' ? '#4B6BA6' : 'white',
                            borderColor: activeTab === 'all' ? '#4B6BA6' : '#4B6BA6'
                        }}
                    >
                        Utilisateurs
                    </button>
                </div>

                {/* User Cards List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4 animate-spin"></div>
                            Chargement...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 italic bg-white rounded-xl border border-gray-200">
                            {activeTab === 'pending' ? 'Aucune demande en attente.' : 'Aucun utilisateur trouvé.'}
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <div 
                                key={user.id} 
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-gray-900 text-sm">{user.fullName || 'Sans nom'}</div>
                                        {user.isAdmin && (
                                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] uppercase font-bold">
                                                Admin
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-600 text-xs mt-0.5">{user.email}</div>
                                </div>

                                <div className="flex gap-2 items-center ml-4">
                                    {user.isApproved ? (
                                        <>
                                            <button
                                                onClick={() => handleToggleAlerts(user.id, user.expirationAlertsEnabled)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                    user.expirationAlertsEnabled
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                <Bell size={12} />
                                                Alertes {user.expirationAlertsEnabled ? 'ON' : 'OFF'}
                                            </button>
                                            <button
                                                onClick={() => handleDeny(user.id)}
                                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                                                title="Supprimer"
                                            >
                                                <UserX size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleDeny(user.id)}
                                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-xs font-bold"
                                            >
                                                Refuser
                                            </button>
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all text-xs font-bold"
                                            >
                                                Approuver
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
